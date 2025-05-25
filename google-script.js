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

      var phrase = 'Bedankt voor jouw bestelling voor';
      var newestSubject = newestMsg.getSubject();
      var newestStartsWithPhrase = newestSubject.toLowerCase().startsWith(phrase.toLowerCase());

      // Check if any previous message with the same phrase was read
      var anyPreviousRead = false;
      for (var i = 1; i < msgs.length; i++) {
        var previousMsg = msgs[i];
        var previousSubject = previousMsg.getSubject();
        var previousStartsWithPhrase = previousSubject.toLowerCase().startsWith(phrase.toLowerCase());

        if (previousStartsWithPhrase && !previousMsg.isUnread()) {
          anyPreviousRead = true;
          break;
        }
      }

      Logger.log('Bestelnummer: ' + bestelnummer);
      Logger.log('Newest message date: ' + newestMsg.getDate());
      Logger.log('Newest starts with phrase: ' + newestStartsWithPhrase);
      Logger.log('Newest is unread: ' + newestMsg.isUnread());
      Logger.log('Any previous message with phrase is read: ' + anyPreviousRead);

      if (newestStartsWithPhrase && newestMsg.isUnread() && anyPreviousRead) {
        Logger.log('Marking newest as read because a previous message with the same phrase was read');
        newestMsg.markRead();
        Logger.log('After markRead, newest is read: ' + !newestMsg.isUnread());
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
