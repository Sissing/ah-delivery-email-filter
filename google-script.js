function deleteOldAHOrderEmails() {
  var sender = 'bestellingen@ah.nl';
  var query = 'from:' + sender + ' in:inbox';
  var threads = GmailApp.search(query, 0, 50); // Always fetch up to 50 threads
  if (threads.length === 0) {
    return; // No emails, nothing to do
  }
  if (threads.length === 1) {
    var messages = threads[0].getMessages();
    if (messages.length === 1) {
      // Only one message in the only thread, just star it
      if (!messages[0].isStarred()) {
        messages[0].star();
      }
      return;
    }
    // If more than one message in the thread, continue to process below
  }
  var bestelnummerRegex = /Bestelnummer:\s*(\d+)/i;
  var bestelnummerMap = {};

  threads.forEach(function(thread) {
    var messages = thread.getMessages();
    messages.forEach(function(message) {
      var body = message.getPlainBody();
      var match = body.match(bestelnummerRegex);
      if (match) {
        var bestelnummer = match[1];
        if (!bestelnummerMap[bestelnummer]) {
          bestelnummerMap[bestelnummer] = [];
        }
        bestelnummerMap[bestelnummer].push(message);
      }
    });
  });

  // For each bestelnummer, keep only the newest message, delete the rest
  Object.keys(bestelnummerMap).forEach(function(bestelnummer) {
    var msgs = bestelnummerMap[bestelnummer];
    if (msgs.length > 1) {
      msgs.sort(function(a, b) {
        return b.getDate() - a.getDate();
      });
      // Mark the newest message with a star
      var newestMsg = msgs[0];
      newestMsg.star();
      // If previous message is read and starts with the phrase, mark newest as read
      if (msgs.length > 1) {
        var previousMsg = msgs[1];
        var previousSubject = previousMsg.getSubject();
        var newestSubject = newestMsg.getSubject();
        var phrase = 'Bedankt voor jouw bestelling voor';
        var previousStartsWithPhrase = previousSubject.toLowerCase().startsWith(phrase.toLowerCase());
        var newestStartsWithPhrase = newestSubject.toLowerCase().startsWith(phrase.toLowerCase());
        Logger.log('Previous starts with phrase in subject: ' + previousStartsWithPhrase);
        Logger.log('Newest starts with phrase in subject: ' + newestStartsWithPhrase);
        Logger.log('Bestelnummer: ' + bestelnummer);
        Logger.log('Previous message date: ' + previousMsg.getDate());
        Logger.log('Newest message date: ' + newestMsg.getDate());
        Logger.log('Previous is unread: ' + previousMsg.isUnread());
        Logger.log('Newest is unread: ' + newestMsg.isUnread());
        if (previousStartsWithPhrase && newestStartsWithPhrase && previousMsg.isUnread() && newestMsg.isUnread()) {
          Logger.log('Condition met: previous and newest start with phrase, previous is unread, newest is unread. Marking newest as read.');
          newestMsg.markRead();
          Logger.log('After markRead, newest is read: ' + !newestMsg.isUnread());
        } else {
          Logger.log('Condition NOT met:');
          Logger.log('  previousStartsWithPhrase: ' + previousStartsWithPhrase);
          Logger.log('  newestStartsWithPhrase: ' + newestStartsWithPhrase);
          Logger.log('  previous is unread: ' + previousMsg.isUnread());
          Logger.log('  newest is unread: ' + newestMsg.isUnread());
        }
      }
      // Always remove the star from all older messages and move them to trash
      for (var i = 1; i < msgs.length; i++) {
        msgs[i].unstar();
        msgs[i].moveToTrash();
      }
    } else if (msgs.length === 1) {
      // If only one message, ensure it is starred
      msgs[0].star();
    }
  });
}
