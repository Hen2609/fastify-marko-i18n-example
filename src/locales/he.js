
export const introWelcome = "ברוך הבא {{name}}!";
export const introDescription = "הדמו הזה עובד בסביבה {{environment}}.";
export const test = "בדיקה"

export function support(obj) {
  let hour = Math.floor(Math.random() * 3) + 9;
  let str = `לשאלות אני זמין ב- ${obj.date.toLocaleDateString()}`;
  str += `, בכל שעה לאחר השעה ${hour}:00.`;
  return str;
}