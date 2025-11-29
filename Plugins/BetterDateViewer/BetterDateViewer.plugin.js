/**
 * @name BetterDateViewer
 * @author ezeholz
 * @authorId 820741927401160714
 * @version 0.4.0
 * @description Displays current time, date and day of the week on your right side. The way it's displayed depends on your locale conventions.
 * @website https://ezeholz.com.ar/
 * @source https://github.com/ezeholz/BDStuff/tree/main/Plugins/BetterDateViewer
 * @updateUrl https://raw.githubusercontent.com/ezeholz/BDStuff/main/Plugins/BetterDateViewer/BetterDateViewer.plugin.js
 */

module.exports = (() => {
    // ===========================
    // Configuration
    // ===========================
    const config = {
        info: {
            name: "BetterDateViewer",
            authors: [
                { name: "hammy", discord_id: "256531049222242304", github_username: "hammy1" },
                { name: "ezeholz", discord_id: "820741927401160714", github_username: "ezeholz" }
            ],
            version: "0.4.0",
            description: "Displays current time, date and day of the week on your right side. The way it's displayed depends on your locale conventions.",
            github: "https://github.com/ezeholz/BDStuff/tree/main/Plugins/BetterDateViewer",
            github_raw: "https://raw.githubusercontent.com/ezeholz/BDStuff/main/Plugins/BetterDateViewer/BetterDateViewer.plugin.js"
        },
        changelog: [
            {
                title: "Code Organization",
                type: "improved",
                items: [
                    "Restructured code for better maintainability",
                    "Separated concerns into logical sections",
                    "Improved error handling and logging",
                    "Added comprehensive JSDoc comments"
                ]
            },
            {
                title: "Performance",
                type: "improved",
                items: [
                    "Optimized update cycle",
                    "Better DOM manipulation",
                    "Reduced redundant operations"
                ]
            }
        ],
        defaultConfig: [
            {
                type: "category",
                id: "formatTime",
                name: "Time Format",
                collapsible: true,
                shown: false,
                settings: [
                    {
                        type: "switch",
                        id: "hour12",
                        name: "12-Hour Format",
                        note: "Use 12-hour time format instead of 24-hour",
                        value: false
                    },
                    {
                        type: "switch",
                        id: "second",
                        name: "Show Seconds",
                        note: "Display seconds in the time",
                        value: true
                    },
                    {
                        type: "switch",
                        id: "lang",
                        name: "Use Country Time Format",
                        note: "Prefer use of country defined time format",
                        value: false
                    },
                    {
                        type: "textbox",
                        id: "custom",
                        name: "Custom Language Tag",
                        note: "Define custom language tag (e.g., en-US, fr-FR)",
                        value: ""
                    },
                    {
                        name: "Style",
                        id: "style",
                        type: "radio",
                        note: "Choose text style for time display",
                        value: 0,
                        options: [
                            { name: "Normal text", value: 0 },
                            { name: "Bold text", value: 1 },
                            { name: "Italic text", value: 2 }
                        ]
                    }
                ]
            },
            {
                type: "category",
                id: "formatDate",
                name: "Date Format",
                collapsible: true,
                shown: false,
                settings: [
                    {
                        type: "switch",
                        id: "firstMonth",
                        name: "Show Month First",
                        note: "Display month before day (MM/DD vs DD/MM)",
                        value: true
                    },
                    {
                        type: "switch",
                        id: "year",
                        name: "Show Full Year",
                        note: "Display 4-digit year instead of 2-digit",
                        value: true
                    },
                    {
                        type: "switch",
                        id: "lang",
                        name: "Use Country Date Format",
                        note: "Prefer use of country defined date format",
                        value: false
                    },
                    {
                        type: "textbox",
                        id: "custom",
                        name: "Custom Language Tag",
                        note: "Define custom language tag (e.g., en-US, fr-FR)",
                        value: ""
                    },
                    {
                        name: "Style",
                        id: "style",
                        type: "radio",
                        note: "Choose text style for date display",
                        value: 0,
                        options: [
                            { name: "Normal text", value: 0 },
                            { name: "Bold text", value: 1 },
                            { name: "Italic text", value: 2 }
                        ]
                    }
                ]
            },
            {
                type: "category",
                id: "formatWeek",
                name: "Week Format",
                collapsible: true,
                shown: false,
                settings: [
                    {
                        type: "textbox",
                        id: "monday",
                        name: "Monday",
                        note: "Custom text for Monday",
                        value: ""
                    },
                    {
                        type: "textbox",
                        id: "tuesday",
                        name: "Tuesday",
                        note: "Custom text for Tuesday",
                        value: ""
                    },
                    {
                        type: "textbox",
                        id: "wednesday",
                        name: "Wednesday",
                        note: "Custom text for Wednesday",
                        value: ""
                    },
                    {
                        type: "textbox",
                        id: "thursday",
                        name: "Thursday",
                        note: "Custom text for Thursday",
                        value: ""
                    },
                    {
                        type: "textbox",
                        id: "friday",
                        name: "Friday",
                        note: "Custom text for Friday",
                        value: ""
                    },
                    {
                        type: "textbox",
                        id: "saturday",
                        name: "Saturday",
                        note: "Custom text for Saturday",
                        value: ""
                    },
                    {
                        type: "textbox",
                        id: "sunday",
                        name: "Sunday",
                        note: "Custom text for Sunday",
                        value: ""
                    },
                    {
                        name: "Style",
                        id: "style",
                        type: "radio",
                        note: "Choose text style for weekday display",
                        value: 0,
                        options: [
                            { name: "Normal text", value: 0 },
                            { name: "Bold text", value: 1 },
                            { name: "Italic text", value: 2 }
                        ]
                    }
                ]
            },
            {
                type: "switch",
                id: "utc",
                name: "UTC Format",
                note: "Display time in UTC instead of local time",
                value: false
            }
        ]
    };

    // ===========================
    // Utility Functions
    // ===========================
    const Utils = {
        /**
         * Safely get Discord member list classes
         * @returns {Object} Member list class names
         */
        getMemberListClasses() {
            try {
                return BdApi.Webpack.getByKeys('members', 'container', 'membersWrap') || {};
            } catch (err) {
                console.error('[BetterDateViewer] Failed to get member list classes:', err);
                return {};
            }
        },

        /**
         * Get the HTML tag based on style value
         * @param {number} style - Style value (0=span, 1=bold, 2=italic)
         * @returns {string} HTML tag name
         */
        getTagForStyle(style) {
            if (style === 1) return "b";
            if (style > 1) return "i";
            return "span";
        },

        /**
         * Format time string based on settings
         * @param {Date} date - Date object
         * @param {Object} settings - Time format settings
         * @param {string} lang - Language code
         * @returns {string} Formatted time string
         */
        formatTime(date, settings, lang) {
            const timeLang = settings.custom || (settings.lang ? lang : 'en-GB');
            return date.toLocaleTimeString(timeLang, {
                hour12: settings.hour12,
                hour: "2-digit",
                minute: "2-digit",
                second: settings.second ? "2-digit" : undefined
            });
        },

        /**
         * Format date string based on settings
         * @param {Date} date - Date object
         * @param {Object} settings - Date format settings
         * @param {string} lang - Language code
         * @returns {string} Formatted date string
         */
        formatDate(date, settings, lang) {
            const dateLang = settings.custom || (settings.lang ? lang : (settings.firstMonth ? 'en-US' : 'en-GB'));
            return date.toLocaleDateString(dateLang, {
                day: "2-digit",
                month: "2-digit",
                year: settings.year ? "numeric" : "2-digit"
            });
        },

        /**
         * Format UTC time manually
         * @param {string[]} timeUTC - UTC time parts [hour, minute, second]
         * @param {boolean} hour12 - Use 12-hour format
         * @param {boolean} showSeconds - Show seconds
         * @returns {string} Formatted UTC time
         */
        formatUTCTime(timeUTC, hour12, showSeconds) {
            let hour = parseInt(timeUTC[0]);
            const minute = timeUTC[1];
            const second = timeUTC[2];

            if (hour12) {
                const period = hour >= 12 ? 'PM' : 'AM';
                hour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
                return `${hour}:${minute}${showSeconds ? ':' + second : ''} ${period}`;
            }

            hour = hour === 24 ? 0 : hour;
            const hourStr = hour.toString().padStart(2, '0');
            return `${hourStr}:${minute}${showSeconds ? ':' + second : ''}`;
        },

        /**
         * Format UTC date manually
         * @param {string[]} dateUTC - UTC date parts [year, month, day]
         * @param {boolean} firstMonth - Show month first
         * @param {boolean} fullYear - Show full year
         * @returns {string} Formatted UTC date
         */
        formatUTCDate(dateUTC, firstMonth, fullYear) {
            const year = fullYear ? dateUTC[0] : dateUTC[0].substring(2, 4);
            const month = dateUTC[1];
            const day = dateUTC[2];

            return firstMonth ? `${month}/${day}/${year}` : `${day}/${month}/${year}`;
        }
    };

    // ===========================
    // Main Plugin Class
    // ===========================
    return class BetterDateViewer {
        constructor(meta) {
            this.meta = meta;
            this.initialized = false;
            this.updateInterval = null;
            this.settings = null;
            this.memberListClasses = null;
            
            // Define styles
            this.style = this.generateStyles();
        }

        // ===========================
        // Plugin Metadata
        // ===========================
        getName() { return config.info.name; }
        getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
        getDescription() { return config.info.description; }
        getVersion() { return config.info.version; }

        // ===========================
        // Style Generation
        // ===========================
        generateStyles() {
            this.memberListClasses = Utils.getMemberListClasses();
            
            return `
                #dv-mount {
                    background-color: var(--background-secondary);
                    bottom: 0;
                    box-sizing: border-box;
                    display: flex;
                    height: 95px;
                    justify-content: center;
                    position: fixed;
                    width: 240px;
                    z-index: 1000;
                }
                
                #dv-main {
                    border-top: 1px solid var(--background-modifier-accent);
                    box-sizing: border-box;
                    color: var(--text-default);
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
                
                .${this.memberListClasses.membersWrap || 'membersWrap'} {
                    height: 100%;
                }
                
                .${this.memberListClasses.membersWrap || 'membersWrap'} .${this.memberListClasses.members || 'members'} {
                    height: calc(100% - 95px);
                }
            `;
        }

        // ===========================
        // Settings Management
        // ===========================
        loadSettings() {
            const defaultSettings = {};
            
            config.defaultConfig.forEach(item => {
                if (item.type === "category") {
                    defaultSettings[item.id] = {};
                    item.settings.forEach(setting => {
                        defaultSettings[item.id][setting.id] = setting.value !== undefined ? setting.value : "";
                    });
                } else {
                    defaultSettings[item.id] = item.value !== undefined ? item.value : false;
                }
            });

            this.settings = Object.assign({}, defaultSettings, BdApi.Data.load(config.info.name, "settings"));
        }

        saveSettings() {
            BdApi.Data.save(config.info.name, "settings", this.settings);
        }

        // ===========================
        // Time Data Generation
        // ===========================
        getTimeData() {
            const date = new Date();
            const lang = document.documentElement.lang || 'en-US';
            const weekKey = date.toLocaleDateString('en-US', { weekday: "long" }).toLowerCase();

            if (this.settings.utc) {
                return this.getUTCTimeData(date, weekKey);
            }

            return this.getLocalTimeData(date, lang, weekKey);
        }

        getLocalTimeData(date, lang, weekKey) {
            try {
                return {
                    time: Utils.formatTime(date, this.settings.formatTime, lang),
                    date: Utils.formatDate(date, this.settings.formatDate, lang),
                    weekday: this.settings.formatWeek[weekKey] || date.toLocaleDateString(lang, { weekday: "long" })
                };
            } catch (err) {
                console.error('[BetterDateViewer] Error formatting local time:', err);
                return this.getFallbackTimeData(date, weekKey);
            }
        }

        getUTCTimeData(date, weekKey) {
            const utc = date.toISOString().split('T');
            const dateUTC = utc[0].split('-');
            const timeUTC = utc[1].split('.')[0].split(':');

            const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const utcWeekKey = dayMap[date.getUTCDay()];

            return {
                time: Utils.formatUTCTime(timeUTC, this.settings.formatTime.hour12, this.settings.formatTime.second),
                date: Utils.formatUTCDate(dateUTC, this.settings.formatDate.firstMonth, this.settings.formatDate.year),
                weekday: this.settings.formatWeek[utcWeekKey] || utcWeekKey
            };
        }

        getFallbackTimeData(date, weekKey) {
            return {
                time: date.toLocaleTimeString('en-GB', {
                    hour12: this.settings.formatTime.hour12,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: this.settings.formatTime.second ? "2-digit" : undefined
                }),
                date: date.toLocaleDateString(this.settings.formatDate.firstMonth ? 'en-US' : 'en-GB', {
                    day: "2-digit",
                    month: "2-digit",
                    year: this.settings.formatDate.year ? "numeric" : "2-digit"
                }),
                weekday: this.settings.formatWeek[weekKey] || date.toLocaleDateString('en-US', { weekday: "long" })
            };
        }

        // ===========================
        // DOM Management
        // ===========================
        render() {
            const memberListWrap = document.querySelector('[class*="membersWrap"]');
            
            if (!memberListWrap) {
                setTimeout(() => this.render(), 1000);
                return;
            }

            let mount = document.getElementById('dv-mount');
            if (!mount) {
                mount = document.createElement('div');
                mount.id = 'dv-mount';
                memberListWrap.appendChild(mount);
            }

            this.updateTime();
        }

        updateTime() {
            const mount = document.getElementById('dv-mount');
            if (!mount) return;

            const timeData = this.getTimeData();
            const timeTag = Utils.getTagForStyle(this.settings.formatTime.style);
            const dateTag = Utils.getTagForStyle(this.settings.formatDate.style);
            const weekTag = Utils.getTagForStyle(this.settings.formatWeek.style);

            mount.innerHTML = `
                <div id="dv-main">
                    <${timeTag} class="dv-time">${timeData.time}</${timeTag}>
                    <${dateTag} class="dv-date">${timeData.date}</${dateTag}>
                    <${weekTag} class="dv-weekday">${timeData.weekday}</${weekTag}>
                </div>
            `;
        }

        // ===========================
        // Settings Panel
        // ===========================
        getSettingsPanel() {
            const panel = document.createElement("div");
            panel.className = "dv-settings-panel";
            panel.style.padding = "10px";

            config.defaultConfig.forEach(item => {
                if (item.type === "category") {
                    panel.appendChild(this.createCategorySetting(item));
                } else {
                    panel.appendChild(this.createSetting(item));
                }
            });

            return panel;
        }

        createCategorySetting(item) {
            const category = document.createElement("details");
            category.style.marginBottom = "20px";
            category.style.padding = "10px";
            category.style.border = "1px solid var(--background-modifier-accent)";
            category.style.borderRadius = "5px";
            category.open = item.shown;

            const summary = document.createElement("summary");
            summary.style.cursor = "pointer";
            summary.style.fontWeight = "bold";
            summary.style.marginBottom = "10px";
            summary.textContent = item.name;

            category.appendChild(summary);

            item.settings.forEach(setting => {
                category.appendChild(this.createSetting(setting, item.id));
            });

            return category;
        }

        createSetting(setting, categoryId = null) {
            const settingDiv = document.createElement("div");
            settingDiv.style.marginBottom = "15px";

            const label = document.createElement("label");
            label.style.display = "block";
            label.style.marginBottom = "5px";
            label.style.fontWeight = "bold";
            label.textContent = setting.name;

            settingDiv.appendChild(label);

            if (setting.note) {
                const note = document.createElement("div");
                note.style.fontSize = "12px";
                note.style.opacity = "0.7";
                note.style.marginBottom = "5px";
                note.textContent = setting.note;
                settingDiv.appendChild(note);
            }

            const control = this.createSettingControl(setting, categoryId);
            if (control) settingDiv.appendChild(control);

            return settingDiv;
        }

        createSettingControl(setting, categoryId) {
            switch (setting.type) {
                case "switch":
                    return this.createSwitchControl(setting, categoryId);
                case "textbox":
                    return this.createTextboxControl(setting, categoryId);
                case "radio":
                    return this.createRadioControl(setting, categoryId);
                default:
                    return null;
            }
        }

        createSwitchControl(setting, categoryId) {
            const toggle = document.createElement("input");
            toggle.type = "checkbox";
            toggle.checked = categoryId 
                ? this.settings[categoryId][setting.id]
                : this.settings[setting.id];
            
            toggle.addEventListener("change", () => {
                if (categoryId) {
                    this.settings[categoryId][setting.id] = toggle.checked;
                } else {
                    this.settings[setting.id] = toggle.checked;
                }
                this.saveSettings();
                this.updateTime();
            });

            return toggle;
        }

        createTextboxControl(setting, categoryId) {
            const input = document.createElement("input");
            input.type = "text";
            input.style.width = "100%";
            input.style.padding = "5px";
            input.value = categoryId 
                ? (this.settings[categoryId][setting.id] || "")
                : (this.settings[setting.id] || "");
            
            input.addEventListener("change", () => {
                if (categoryId) {
                    this.settings[categoryId][setting.id] = input.value;
                } else {
                    this.settings[setting.id] = input.value;
                }
                this.saveSettings();
                this.updateTime();
            });

            return input;
        }

        createRadioControl(setting, categoryId) {
            const radioGroup = document.createElement("div");
            
            setting.options.forEach(option => {
                const radioDiv = document.createElement("div");
                radioDiv.style.marginBottom = "5px";

                const radio = document.createElement("input");
                radio.type = "radio";
                radio.name = `${categoryId || 'root'}-${setting.id}`;
                radio.value = option.value;
                radio.checked = categoryId
                    ? this.settings[categoryId][setting.id] === option.value
                    : this.settings[setting.id] === option.value;

                radio.addEventListener("change", () => {
                    if (categoryId) {
                        this.settings[categoryId][setting.id] = option.value;
                    } else {
                        this.settings[setting.id] = option.value;
                    }
                    this.saveSettings();
                    this.updateTime();
                });

                const radioLabel = document.createElement("label");
                radioLabel.style.marginLeft = "5px";
                radioLabel.textContent = option.name;

                radioDiv.appendChild(radio);
                radioDiv.appendChild(radioLabel);
                radioGroup.appendChild(radioDiv);
            });

            return radioGroup;
        }

        // ===========================
        // Lifecycle Methods
        // ===========================
        start() {
            try {
                this.loadSettings();
                BdApi.DOM.addStyle(config.info.name, this.style);
                this.render();
                this.updateInterval = setInterval(() => this.updateTime(), 1000);
                this.initialized = true;
                BdApi.UI.showToast(`${config.info.name} v${config.info.version} started`, { type: "success" });
            } catch (err) {
                console.error('[BetterDateViewer] Error starting plugin:', err);
                BdApi.UI.showToast(`${config.info.name} failed to start`, { type: "error" });
            }
        }

        stop() {
            try {
                BdApi.DOM.removeStyle(config.info.name);
                
                if (this.updateInterval) {
                    clearInterval(this.updateInterval);
                    this.updateInterval = null;
                }
                
                const mount = document.getElementById('dv-mount');
                if (mount) mount.remove();
                
                BdApi.UI.showToast(`${config.info.name} stopped`, { type: "info" });
            } catch (err) {
                console.error('[BetterDateViewer] Error stopping plugin:', err);
            }
        }

        observer(changes) {
            if (!document.getElementById('dv-mount')) {
                this.render();
            }
        }
    };
})();