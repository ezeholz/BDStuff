/**
 * @name Quests Autocomplete
 * @version 1.1.4
 * @author ezeholz
 * @description Automatically completes Discord quests by fetching and executing code from a trusted Gist.
 * @authorId 820741927401160714
 * @website https://ezeholz.com.ar/
 * @source https://github.com/ezeholz/BDStuff/tree/main/Plugins/QuestsAutocomplete
 * @updateUrl https://raw.githubusercontent.com/ezeholz/BDStuff/main/Plugins/QuestsAutocomplete/QuestsAutocomplete.plugin.js
 */

module.exports = (() => {
    return class QuestsAutocomplete {
        constructor(meta) {for (let key in meta) {
			if (!this[key]) this[key] = meta[key];
		}}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return this.description;}

		isQuestAvailable(){
			BdApi.Plugins.disable(this.getName())
		}
		questsResolver = this.isQuestAvailable

		async load() {
			let content = await this.constructor.grabGistCode().catch((err)=>{
				BdApi.alert(err.message, err)
				throw new Error(err);
			})

			const questsStoreBlock = content.match(/let\s*QuestsStore\s*=\s*[\s\S]*?\n/)[0].trim();
			const questBlock = content.match(/let\s*quest\s*=\s*[\s\S]*?\n/)[0].trim();
			
			this.isQuestAvailable = function (){
				eval(`
					${questsStoreBlock}
					${questBlock}
					if (quest && this.lastQuestId != quest.config.application.id) {
						this.lastQuestId = quest.config.application.id
						this.questsResolver()
					}
					`)
			}

			this.questsResolver = function () {
				// Step D: Wrap and run it in a safe function
				const wrappedCode = `
					(function runGistCode() {
					try {
						${content}
					} catch (error) {
						console.error('Error executing Gist code:', error);
						BdApi.alert('Error executing Gist code', error)
					}
					})();`;

				// Step E: Evaluate the wrapped code
				eval(wrappedCode);
			}
		}

		static async grabGistCode() {
			const url = 'https://gist.githubusercontent.com/aamiaa/204cd9d42013ded9faf646fae7f89fbb/raw/CompleteDiscordQuest.md';
	
			// Step A: Fetch the raw Markdown
			const response = await fetch(url);
			if (!response.ok) throw new Error(`Failed to fetch Gist: ${response.statusText}`);
			const mdText = await response.text();
	
			// Step B: Extract the JS code block
			const codeMatch = mdText.match(/```js([\s\S]*?)```/);
			if (!codeMatch) throw new Error('No JS code block found in the Gist.');
			let jsCode = codeMatch[1].trim();

			// Step C: Replace with BdApi modules
			jsCode = jsCode.replace(/delete\s*window\.\$[\s\S]*?\n{2}/, '')
			jsCode = jsCode.replaceAll(/Object\.values\(wpRequire\.c\)\.find\(x => x\?\.exports\?\.(?:ZP?|tn)\?(?:\.__proto__\?)?\./g, 'BdApi.Webpack.getByKeys("')
			jsCode = jsCode.replaceAll(/get\)\.exports\.(?:tn)/g, 'tn", "K0").tn')
			jsCode = jsCode.replaceAll(/\)\.exports\.(?:ZP?)/g, '")')
	
			// Step D: Check for compromised gist
			const suspiciousPatterns = [
				/localStorage\s*\.\s*getItem\s*\(\s*['"]token['"]\s*\)/i,
				/JSON\.parse\([\s\S]*localStorage\.token\)/i,
				/webpackChunkdiscord_app/i,
				/\.getToken\s*\(\s*\)/i,
				/contentWindow\.localStorage\.token/i
			];
	
			for (const pattern of suspiciousPatterns) {
				if (pattern.test(jsCode)) {
					BdApi.Plugins.disable(config.info.name)
					console.error("⚠️ Suspicious code detected — possible Discord token grab attempt. Aborting execution.\n", jsCode.match(pattern)[0].trim())
					throw new Error("⚠️ Suspicious code detected — possible Discord token grab attempt. Aborting execution.");
				}
			}


			return jsCode
		}

        start(i=0) {
			this.load()
			this.intervalNum = setInterval(() => {
				if (this.isQuestAvailable()) {this.questsResolver()}
			}, 5*1000);
		}

        stop() {
			clearInterval(this.intervalNum)
		}

	}
})();
