import plugin from "fastify-plugin";
import Negotiator from "negotiator";
import { AsyncLocalStorage } from "async_hooks";

const locales = Object.fromEntries(
  Object.entries(import.meta.glob("/src/locales/*.js", { eager: true })).map(
    ([key, value]) => {
      const [, locale] = key.match(/\/src\/locales\/(.+)\.js$/);
      return [locale, value];
    }
  )
);

const languages = Object.keys(locales);

/**
 * A Fastify plugin that sets the language based on the Accept-Language header
 * and stores it in our languageStore.
 */
const languageStore = new AsyncLocalStorage();
//captures a lanuage subdomain: ( www.en.test.com || en.test.com ) => lang: en
const language_subdomain_regex = new RegExp(/(?:www\.)?((?<lang>\w{2,3})\.)?.+/);
export default plugin(async (app) => {
  app.addHook("onRequest", (request, _reply, done) => {
    const language = request.hostname.match(language_subdomain_regex).groups?.lang;
    if(language && languages.includes(language)){
      languageStore.run(language,done)
    }else {
      languageStore.run(new Negotiator(request.raw).language(languages), done);
    }
  });
});

/**
 * Returns the current translations object.
 */
export function getLocale() {
  return locales[languageStore.getStore() || "en"];
}

/**
 * Generates a script tag that can be used to set the i18n object on the client.
 */
export function getScript() {
  const locale = getLocale();
  let script = `$i18n={`;
  let sep = "";
  for (const key in locale) {
    const val = locale[key];
    script += `${sep + key}:`;
    sep = ",";
    switch (typeof val) {
      case "function":
        script += val.toString();
        break;
      case "string":
        script += JSON.stringify(val);
        break;
    }
  }
  script += "}";
  return script;
}
