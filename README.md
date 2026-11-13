# Battery Manager Card

Lovelace card (`custom:batterie-manager`) for the **Battery Manager** integration (`battery_manager_ha_integration`, domain `batterie_manager`). It shows every battery-powered device of your home with its level, forecast and replacement history, and lets you manage battery classes, battery types, notification rules and settings – all data comes from the integration's WebSocket API (stored in MariaDB by the integration).

UI language: German.

## Features

- Device list with filters (all / empty / check / soon / offline / OK / muted) and grouping by level, area, class, battery type, status or forecast
- Tabs: devices, classes, battery types, rules, settings, history
- Shows "needed batteries" (shopping list) and open replacement tasks
- Creates / ignores [Battery Notes](https://github.com/andrew-codechimp/HA-Battery-Notes) discovery entries and sets the "battery replaced" date via Battery Notes
- Live updates via `batterie_manager/subscribe`
- Admin-only actions are hidden for non-admin users
- Styled to match the **Room Tablet** theme (`room_tablet_ha_theme`)

## Requirements

- [battery_manager_ha_integration](https://github.com/SysriX/battery_manager_ha_integration) (domain `batterie_manager`)
- Optional: Battery Notes (for battery types / replacement dates)

## Installation

### HACS (custom repository)

1. HACS → ⋮ → **Custom repositories** → add `https://github.com/SysriX/battery_manager_ha_card`, category **Dashboard**.
2. Install the card from HACS and reload the browser.
3. HACS registers the resource automatically: `/hacsfiles/battery_manager_ha_card/battery_manager_ha_card.js` (JavaScript module).

### Manual

1. Copy `dist/battery_manager_ha_card.js` to `/config/www/battery_manager_ha_card.js`.
2. Settings → Dashboards → ⋮ → **Resources** → add `/local/battery_manager_ha_card.js` as **JavaScript module**.
3. Reload the browser.

## Configuration

```yaml
type: custom:batterie-manager
title: Batterien          # optional header text (default "Batterien")
kompakt: false            # true = only the device list
raum: Küche               # optional: area name; compact mode if this area is listed in the
                          # integration setting "panel_compact"
ansicht:                  # optional fixed start view (not remembered in the browser)
  tab: geraete            # geraete | klassen | typen | regeln | einst | verlauf
  filter: alle            # alle | low | chk | mid | off | ok | stumm
  gruppe: raum            # stand | raum | klasse | typ | status | prognose
```

All options are optional. Without `ansicht` the last used tab/filter/grouping is remembered per browser (localStorage).

The card loads the fonts Rajdhani and Share Tech Mono from Google Fonts.

## Notes

This card was built for the author's own home and tablets. Some defaults (entity ids, dashboard paths) reflect that setup and may need to be set explicitly in your configuration.

## Version

2.5.3

## License

MIT – see [LICENSE](LICENSE).
