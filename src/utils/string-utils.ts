/**
 * Decodes given base64 string
 * @param encodedString {string} The card service type of the company
 * @returns decoded string
 */
export const decodeBase64String = (encodedString: string) => {
  const buff = Buffer.from(encodedString, 'base64');
  return buff.toString('utf-8');
};
