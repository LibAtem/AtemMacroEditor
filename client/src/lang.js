import LocalizedStrings from 'react-localization';

import { FindFieldSpec } from './spec';

export const Lang = new LocalizedStrings({
  en: {
    ids: {
      mixEffectBlockIndex: "ME {0}",
      keyIndex: "Key {0}",
      keyIndexDownstream: "DSK {0}",
      mediaPlayer: "MP {0}",
      index: "#{0}",
      boxIndex: "Box {0}",
      auxiliaryIndex: "Aux {0}",
      hyperDeckIndex: "Deck {0}",
    },
  }
});

export const IdFields = {
  "mixEffectBlockIndex": (t, id) => Lang.formatString(Lang.ids.mixEffectBlockIndex, parseInt(id) + 1),
  "keyIndex": KeyIndex,
  "boxIndex": (t, id) => Lang.formatString(Lang.ids.boxIndex, parseInt(id) + 1),
  "mediaPlayer": (t, id) => Lang.formatString(Lang.ids.mediaPlayer, parseInt(id) + 1),
  "auxiliaryIndex": (t, id) => Lang.formatString(Lang.ids.auxiliaryIndex, parseInt(id) + 1),
  "hyperDeckIndex": (t, id) => Lang.formatString(Lang.ids.hyperDeckIndex, parseInt(id) + 1),
};

function KeyIndex(type, id){
  if (type.indexOf("Downstream") == 0)
    return Lang.formatString(Lang.ids.keyIndexDownstream, parseInt(id) + 1);

  return Lang.formatString(Lang.ids.keyIndex, parseInt(id) + 1);
}
