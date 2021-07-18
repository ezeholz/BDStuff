/**
 * @name DateViewer
 * @author ezeholz
 * @authorId 820741927401160714
 * @version 0.2.8
 * @description Displays current time, date and day of the week on your right side. The way it's displayed depends on your locale conventions.
 * @website https://ezeholz.com.ar/
 * @source https://github.com/ezeholz/BDStuff/tree/master/Plugins/dateViewer
 * @updateUrl https://raw.githubusercontent.com/ezeholz/BDStuff/master/Plugins/dateViewer/dateViewer.plugin.js
 */

var DateViewer = (() => {
    const config = {
		info:{
			"name":"Date Viewer",
			"authors":[
				{"name":"hammy","discord_id":"256531049222242304","github_username":"hammy1"},
				{"name":"ezeholz","discord_id":"820741927401160714","github_username":"ezeholz"}
			],
			"version":"0.2.8",
			"description":"Displays current time, date and day of the week on your right side. The way it's displayed depends on your locale conventions.",
			"github":"https://github.com/ezeholz/BDStuff/tree/master/Plugins/dateViewer",
			"github_raw":"https://raw.githubusercontent.com/ezeholz/BDStuff/master/Plugins/dateViewer/dateViewer.plugin.js"
		},
		changelog: [
			{
				"title": "We pass the torch!",
				"type": "improved",
				"items": [
					"Now this looks a lot better. It's the same, but better."
				]
			},
			{
				"title": "Fixed Almost Everything!",
				"type": "fixed",
				"items": [
					"**Update compatibility with MemberCount**: Now, you don't need to struggle with time AND all those friends you have.",
					"**Width not hardcoded anymore**: Because we all love those themes that change the width of the members list.",
					"**Now it should appear in DM's as expected**: Even better if you can't afford paying for a free discord server. Oh, wait, it's free."
				]
			},
			{
				"title": "New Stuff!",
				"type": "added",
				"items": [
					"**Settings**: Let's customize those rocky numbers.",
				]
			},
		],
		defaultConfig: [
			{
				type:"category",
				id:"formatTime",
				name:"Time Format",
				collapsible:true,
				shown:false,
				settings:[
					{
						type:"switch",
						id:"hour12",
						name:"12-Hour Format",
						value:false
					},
					{
						type:"switch",
						id:"second",
						name:"Show Seconds",
						value:true
					},
				]
			},
			{
				type:"category",
				id:"formatDate",
				name:"Date Format",
				collapsible:true,
				shown:false,
				settings:[
					{
						type:"switch",
						id:"firstMonth",
						name:"Show Month First",
						value:true
					},
					{
						type:"switch",
						id:"year",
						name:"Show full year",
						value:true
					},
				]
			},
			{
				type:"category",
				id:"formatWeek",
				name:"Week Format",
				collapsible:true,
				shown:false,
				settings:[
					{
						type:"textbox",
						id:"monday",
						name:"Monday",
					},
					{
						type:"textbox",
						id:"tuesday",
						name:"Tuesday",
					},
					{
						type:"textbox",
						id:"wednesday",
						name:"Wednesday",
					},
					{
						type:"textbox",
						id:"thursday",
						name:"Thusday",
					},
					{
						type:"textbox",
						id:"friday",
						name:"Friday",
					},
					{
						type:"textbox",
						id:"saturday",
						name:"Saturday",
					},
					{
						type:"textbox",
						id:"sunday",
						name:"Sunday",
					},
				]
			},
		]
	};

    return !global.ZeresPluginLibrary ? class {
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {window.BdApi.alert("Library Missing",`The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);}
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
	const {PluginUtilities, DiscordSelectors, WebpackModules, DiscordModules, Patcher, ReactTools} = Api;
	const Scroller = WebpackModules.getByProps("ScrollerThin");
	const Lists = WebpackModules.getByProps("ListThin");
	
	const ErrorBoundary = class ErrorBoundary extends DiscordModules.React.Component {
		constructor(props) {
			super(props);
			this.state = {hasError: false};
		}
		
		static getDerivedStateFromError(error) {
			return {hasError: true};
		}
		
		componentDidCatch(error, info) {
			console.error(`[${config.info.name}|Error]`, error);
		}
		
		render() {
			if (this.state.hasError) return DiscordModules.React.createElement("div", {className: "react-error"}, "Component Error!");
			return this.props.children;
		}
	};
			
	const WrapBoundary = (Original) => {
		return class Boundary extends DiscordModules.React.Component {
			render() {
				return DiscordModules.React.createElement(ErrorBoundary, null, DiscordModules.React.createElement(Original, this.props));
			}
		};
	};
	
	const Viewer = class Viewer extends DiscordModules.React.Component {
		constructor(props) {
			super(props);
			this.interval;
			this.state = {time: "", date: "", weekday: ""};
			this.update = this.update.bind(this);
			this.settings = props.children.settings
		}

		componentDidMount() {
			this.update();
			this.interval = setInterval(() => this.update(), 1000);
		}

		componentWillUnmount() {
			clearInterval(this.interval);
		}

		update() {
			const date = new Date();
			const lang = document.documentElement.lang;

			let week = date.toLocaleDateString(lang, {weekday: "long"}).toLowerCase()

			this.setState({
				time: date.toLocaleTimeString(lang, {hour12: this.settings.formatTime.hour12, hour: "2-digit", minute: "2-digit", second: this.settings.formatTime.second? "2-digit":undefined}),
				date: date.toLocaleDateString(this.settings.formatDate.firstMonth?'en-US':'en-GB', {day: "2-digit", month: "2-digit", year: this.settings.formatDate.year?"numeric":"2-digit"}),
				weekday: this.settings.formatWeek[week]!==undefined?this.settings.formatWeek[week]:week
			});
		}

		render() {
			if (!document.getElementsByClassName("members-1998pB")[0]) return null;
			return DiscordModules.React.createElement("div", {
				id: "dv-mount"
			},
				DiscordModules.React.createElement("div", {
					id: "dv-main"
				},
					DiscordModules.React.createElement("span", {
						className: "dv-time"
					}, this.state.time),
					DiscordModules.React.createElement("span", {
						className: "dv-date"
					}, this.state.date),
					DiscordModules.React.createElement("span", {
						className: "dv-weekday"
					}, this.state.weekday)
				)
			);
		}
	}

    return class DateViewer extends Plugin {
        constructor() {
            super();
			this.initialized = false;
			this.style = `
				#dv-mount {
					background-color: var(--background-secondary);
					bottom: 0;
					box-sizing: border-box;
					display: flex;
					height: 95px;
					justify-content: center;
					position: absolute;
					width: 100%;
				}
				#dv-main {
					border-top: 1px solid var(--background-modifier-accent);
					box-sizing: border-box;
					color: var(--text-normal);
					display: flex;
					flex-direction: column;
					height: 100%;
					line-height: 20px;
					justify-content: center;
					text-align: center;
					text-transform: uppercase;
					width: calc(100% - 40px);
				}
				#dv-main .dv-date {
					font-size: small;
					opacity: 0.6;
				}
				${DiscordSelectors.MemberList.membersWrap} ${DiscordSelectors.MemberList.members} {
					height: calc(100% - 95px);
				}
			`;
        }
		
        onStart() {
            PluginUtilities.addStyle(this.getName()  + "-style", this.style);
			this.patchMemberList();
			this.initialized = true;
		}
		
        onStop() {
            PluginUtilities.removeStyle(this.getName()  + "-style");
			Patcher.unpatchAll();
			this.updateMemberList();
		}

		patchMemberList() {
			if (!Lists) return;
			
			Patcher.after(Scroller.ScrollerThin, "render", (that, args, value) => {
				const val = Array.isArray(value) ? value.find((item) => item && !item.key) : value;
				const props = this.getProps(val, "props");
				if (!props || !props.className || !props.className.startsWith("members")) return value;

				const viewer = DiscordModules.React.createElement(WrapBoundary(Viewer), {key: "DateViewer-Instance"}, {settings: Object.assign({},this.settings)});
				const fn = (item) => item && item.key && item.key === "DateViewer-Instance";
				
				if (!Array.isArray(value)) value = [value];
				if (!value.some(fn)) value.push(viewer);

				return value;
			})
			
			Patcher.after(Lists.ListThin, "render", (that, args, value) => {
				const val = Array.isArray(value) ? value.find((item) => item && !item.key) : value;
				const props = this.getProps(val, "props");
				if (!props || !props.id || !props.id.startsWith("members")) return value;

				const viewer = DiscordModules.React.createElement(WrapBoundary(Viewer), {key: "DateViewer-Instance"}, {settings: Object.assign({},this.settings)});
				const fn = (item) => item && item.key && item.key === "DateViewer-Instance";
				
				if (!Array.isArray(value)) value = [value];
				if (!value.some(fn)) value.push(viewer);

				return value;
			});
			
			this.updateMemberList();
		}

		updateMemberList() {
			const memberList = document.querySelector(DiscordSelectors.MemberList.members.value.trim());
			if (memberList) ReactTools.getOwnerInstance(memberList).forceUpdate();
		}

		getProps(obj, path) {
			return path.split(/\s?\.\s?/).reduce((object, prop) => object && object[prop], obj);
		}

		getSettingsPanel(){
			var panel = this.buildSettingsPanel()
			panel.addListener(() => {
                this.updateMemberList();
            });
			return panel.getElement();
		}
	}
}
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();

module.exports = DateViewer;
