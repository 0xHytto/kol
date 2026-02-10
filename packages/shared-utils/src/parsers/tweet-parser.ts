export function parseTweetThread(content: string): string[] {
  // Split by numbered tweets or natural breaks
  const tweets = content
    .split(/\n(?=\d+\/\d+|\d+\.)/)
    .map((tweet) => tweet.trim())
    .filter((tweet) => tweet.length > 0);

  return tweets.length > 0 ? tweets : [content];
}

export function extractHashtags(content: string): string[] {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  const matches = content.match(hashtagRegex);
  return matches ? matches.map((tag) => tag.slice(1)) : [];
}

export function extractMentions(content: string): string[] {
  const mentionRegex = /@[\w]+/g;
  const matches = content.match(mentionRegex);
  return matches ? matches.map((mention) => mention.slice(1)) : [];
}

export function extractUrls(content: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const matches = content.match(urlRegex);
  return matches || [];
}
