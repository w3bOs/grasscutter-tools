import { type MonsterType, type WeaponType, type MaterialType, transformItems } from '../common/transform'
import artifactInfoJson from './artifactInfo.json?raw'
import avatarItemJson from './avatarItem.json?raw'
import materialItemJson from './materialItem.json?raw'
import monsterItemJson from './monsterItem.json?raw'
import questItemJson from './questItem.json?raw'
import { route } from './route'
import sceneItemJson from './sceneItem.json?raw'
import weaponItemJson from './weaponItem.json?raw'
import weatherItemJson from './weatherItem.json?raw'

const monsterTypeDict: Record<MonsterType, string> = {
  MONSTER_ORDINARY: 'Monstruo',
  MONSTER_BOSS: 'Jefe',
  MONSTER_ENV_ANIMAL: 'Animal',
  MONSTER_FISH: 'Pez',
  MONSTER_PARTNER: 'Compañero'
}

const questTags = ['oculto', 'test', 'no liberado']

const weatherType = ['soleado', 'nublado', 'lluvia', 'tormenta', 'nevado', 'neblina']

const itemTags = ['Personajes', 'Armas', 'Materiales']

const weaponTypeDict: Record<WeaponType, string> = {
  WEAPON_SWORD_ONE_HAND: 'Espada Ligera',
  WEAPON_CLAYMORE: 'Mandoble',
  WEAPON_POLE: 'Lanza',
  WEAPON_CATALYST: 'Catalizador',
  WEAPON_BOW: 'Arco'
}

const materialTypeDict: Record<MaterialType, string> = {
  undefined: 'Misceláneos',
  FAKE_ABSORBATE: 'FAKE_ABSORBATE',
  ADSORBATE: 'ADSORBATE',
  CONSUME: 'Consumibles',
  TALENT: 'Talentos',
  AVATAR: 'Personajes',
  CHEST: 'Cofres',
  NOTICE_ADD_HP: 'NOTICE_ADD_HP',
  EXCHANGE: 'Trueques',
  WOOD: 'Madera',
  QUEST: 'Misión',
  CRICKET: 'Grillos',
  WIDGET: 'Artilugios',
  ELEM_CRYSTAL: 'ELEM_CRYSTAL',
  SPICE_FOOD: 'Comida picante',
  ACTIVITY_GEAR: 'ACTIVITY_GEAR',
  ACTIVITY_ROBOT: 'ACTIVITY_ROBOT',
  ACTIVITY_JIGSAW: 'ACTIVITY_JIGSAW',
  FOOD: 'Comida',
  EXP_FRUIT: 'EXP_FRUIT',
  WEAPON_EXP_STONE: 'WEAPON_EXP_STONE',
  AVATAR_MATERIAL: 'AVATAR_MATERIAL',
  RELIQUARY_MATERIAL: 'RELIQUARY_MATERIAL',
  CONSUME_BATCH_USE: 'CONSUME_BATCH_USE',
  FISH_BAIT: 'FISH_BAIT',
  CHEST_BATCH_USE: 'CHEST_BATCH_USE',
  SELECTABLE_CHEST: 'SELECTABLE_CHEST',
  HOME_SEED: 'HOME_SEED',
  FLYCLOAK: 'FLYCLOAK',
  BGM: 'Bgm',
  SEA_LAMP: 'SEA_LAMP',
  CHANNELLER_SLAB_BUFF: 'CHANNELLER_SLAB_BUFF',
  FISH_ROD: 'Fish Rod',
  NAMECARD: 'Namecard',
  ARANARA: 'ARANARA',
  DESHRET_MANUAL: 'DESHRET_MANUAL',
  FIREWORKS: 'FIREWORKS',
  COSTUME: 'Vestimentas',
  FURNITURE_SUITE_FORMULA: 'FURNITURE_SUITE_FORMULA',
  FURNITURE_FORMULA: 'FURNITURE_FORMULA'
}

const items = transformItems({
  artifactInfoJson,
  monsterItemJson,
  monsterTypeDict,
  questItemJson,
  questTags,
  sceneItemJson,
  weatherItemJson,
  weatherType,
  itemTags,
  avatarItemJson,
  weaponItemJson,
  weaponTypeDict,
  materialItemJson,
  materialTypeDict
})

const message: Message = { route, ...items }

export default message
