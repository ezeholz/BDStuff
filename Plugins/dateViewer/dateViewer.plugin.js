/**
 * @name DateViewer
 * @author ezeholz
 * @authorId 820741927401160714
 * @version 0.3.1
 * @description Deprecated as the updater now wrongly tries to update it.
 * @website https://ezeholz.com.ar/
 * @source https://github.com/ezeholz/BDStuff/tree/main/Plugins/BetterDateViewer
 * @updateUrl https://raw.githubusercontent.com/ezeholz/BDStuff/main/Plugins/BetterDateViewer/BetterDateViewer.plugin.js
 */

const fileSystem = require("fs");

module.exports = (() => {
	const config = {
        info: {
            name: "DateViewer",
            authors: [
                { name: "hammy", discord_id: "256531049222242304", github_username: "hammy1" },
                { name: "ezeholz", discord_id: "820741927401160714", github_username: "ezeholz" }
            ],
            version: "0.3.1",
            description: "Deprecated as the updater now wrongly tries to update it. Use BetterDateViewer instead.",
            github: "https://github.com/ezeholz/BDStuff/tree/main/Plugins/BetterDateViewer",
            github_raw: "https://raw.githubusercontent.com/ezeholz/BDStuff/main/Plugins/BetterDateViewer/BetterDateViewer.plugin.js"
        },
	};
    return class DateViewer {
        constructor(meta) {for (let key in meta) {
			if (!this[key]) this[key] = meta[key];
		}}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return this.description;}

		load() {}

        start() {
            // Check and rename config file
            const oldConfigPath = `${BdApi.Plugins.folder}/DateViewer.config.json`;
            const newConfigPath = `${BdApi.Plugins.folder}/BetterDateViewer.config.json`;
            if (fileSystem.existsSync(oldConfigPath)) {
                fileSystem.renameSync(oldConfigPath, newConfigPath);
            }
        }

        stop() {}
	}
})();
