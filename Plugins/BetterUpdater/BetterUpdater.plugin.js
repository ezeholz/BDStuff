/**
 * @name BetterUpdater
 * @version 0.0.1
 * @author ezeholz
 * @description Automatically checks for updates for non-official BetterDiscord plugins from GitHub repositories.
 * @authorId 820741927401160714
 * @website https://ezeholz.com.ar/
 * @source https://github.com/ezeholz/BDStuff/tree/main/Plugins/BetterUpdater
 * @updateUrl https://raw.githubusercontent.com/ezeholz/BDStuff/main/Plugins/BetterUpdater/BetterUpdater.plugin.js
 */

const fileSystem = require("fs");

module.exports = (() => {
    return class BetterUpdater {
        constructor(meta) {for (let key in meta) {
			if (!this[key]) this[key] = meta[key];
		}}
        getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return this.description;}

		load() {
            this.notif = null;
            this.pending = [];
            this.interval = null;
        }
		
        start() {
            this.interval = setInterval(() => {
                this.loop();
            }, 15 * 60 * 1000);
            this.loop();
        }

        loop() {
            BdApi.Plugins.getAll().forEach(plugin => {
                this.processUpdateCheck(plugin);
            });
        }
		
        stop() {
            this.pending = [];
            this.closeUpdateNotice();
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }

        processUpdateCheck(plugin) {
            const updateLink = plugin.updateUrl || plugin.github_raw || plugin.source;
            BdApi.Net.fetch(this.constructor.convertGitHubToRawURL(updateLink)).then(response => {
                if (!response.ok) return;
                return response.text();
            }).then(result => {
                const remoteVersion = this.constructor.versioner(result);
                const hasUpdate = this.constructor.comparator(plugin.version, remoteVersion);
                if (hasUpdate) {
                    this.pending.push(plugin);
                    this.showUpdateNotice();
                }
            }).catch(() => {});
        }

        static versioner(content) {
            const remoteVersion = content.match(/@version [0-9]+\.[0-9]+\.[0-9]+/i);
            if (!remoteVersion) return "0.0.0";
            return remoteVersion.toString().replace("@version ", "");
        }

        static comparator(currentVersion, remoteVersion) {
            currentVersion = currentVersion.split(".").map((e) => {return parseInt(e);});
            remoteVersion = remoteVersion.split(".").map((e) => {return parseInt(e);});

            if (remoteVersion[0] > currentVersion[0]) return true;
            else if (remoteVersion[0] == currentVersion[0] && remoteVersion[1] > currentVersion[1]) return true;
            else if (remoteVersion[0] == currentVersion[0] && remoteVersion[1] == currentVersion[1] && remoteVersion[2] > currentVersion[2]) return true;
            return false;
        }

        showUpdateNotice() {
            if (!this.pending.length) return;

            if (this.notif) this.notif.close();
            this.notif = BdApi.UI.showNotification({
                id: `better-updater-plugins`,
                title: "BetterUpdates Availables",
                content: [
                    `There are ${this.pending.length} plugins with updates available:`,
                    BdApi.React.createElement("ul", {className: "bd-notification-updates-list"},
                        this.pending.map(plugin =>
                            BdApi.React.createElement("li", {}, [
                                plugin.name, " ", BdApi.React.createElement("i", {}, `(${plugin.version})`)
                            ])
                        )
                    )
                ],
                type: "info",
                duration: Infinity,
                actions: [
                    {
                        label: "Update All",
                        onClick: () => {
                            for (const plugin of this.pending) {
                                this.updateAddon(plugin);
                            }
                        }
                    }
                ]
            });
        }

        closeUpdateNotice() {
            if (!this.pending.length && this.notif) {
                this.notif.close();
                this.notif = null;
            }
        }

        static convertGitHubToRawURL(githubURL) {
            if (!githubURL) return githubURL;
            const GITHUB_URL_REGEX = /^https:\/\/github\.com\/(.+?)\/(.+?)\/blob\/(.+?)\/(.+)$/;
            const match = githubURL.match(GITHUB_URL_REGEX);
            if (!match) {
                return githubURL;
            }
            const [, user, repo, commit, filePath] = match;
            return `https://raw.githubusercontent.com/${user}/${repo}/${commit}/${filePath}`;
        }

        updateAddon(plugin) {
            const pluginFolder = BdApi.Plugins.folder;
            const updateLink = plugin.updateUrl || plugin.github_raw || plugin.source;
            BdApi.Net.fetch(this.constructor.convertGitHubToRawURL(updateLink)).then(response => {
                if (!response.ok) throw new Error(`Failed to download update for ${plugin.name}`);
                return response.text();
            }).then(result => {
                const filePath = `${pluginFolder}/${plugin.filename}`;
                fileSystem.writeFile(filePath, result, (err) => {
                    if (err) throw err;
                    BdApi.UI.showNotification({
                        title: "Update Downloaded",
                        content: `${plugin.name} has been updated.`,
                        type: "success",
                        duration: 2000
                    });
                    this.pending = this.pending.filter(p => p.name !== plugin.name);
                    this.closeUpdateNotice();
                });
            }).catch(error => {
                BdApi.UI.showNotification({
                    title: "Update Failed",
                    content: `Failed to update ${plugin.name}: ${error.message}`,
                    type: "error",
                    duration: 2000
                });
            });
        }
	}
})();
