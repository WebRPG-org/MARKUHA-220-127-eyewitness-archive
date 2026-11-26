
/*:
 * @plugindesc [v1.1] Fear and Hunger 2-style gun system — direct ammo use, no reloading, no magazine. Ammo is item-based. 🔫📦
 * @author ChatGPT
 *
 * @param Weapons
 * @type struct<GunDef>[]
 * @desc Configure guns: ammo item, sounds, etc.
 * @default []
 *
 * @help
 * This version uses ammo directly from inventory. No internal magazine or reloading system.
 *
 * Notes:
 *  - Works only with actor in weapon slot 0
 *  - Skills must have <GunSkill> tag in Note field
 *  - Ammo is consumed directly from inventory
 */

/*~struct~GunDef:
 * @param weaponId
 * @type number
 * @min 1
 * @desc ID of the weapon from the database

 * @param ammoItemId
 * @type number
 * @min 1
 * @desc ID of the ammo item (consumed when shooting)

 * @param emptySound
 * @type file
 * @dir audio/se
 * @desc Sound when trying to fire with no ammo
 */

(() => {
  const parameters = PluginManager.parameters("GunSystem_FHT");
  const rawGuns = JSON.parse(parameters["Weapons"] || "[]");
  const GunData = {};

  rawGuns.forEach(gun => {
    const data = JSON.parse(gun);
    const id = Number(data.weaponId);
    GunData[id] = {
      ammoItemId: Number(data.ammoItemId),
      emptySound: data.emptySound
    };
  });

  const _GS_makeDamageValue = Game_Action.prototype.makeDamageValue;
  Game_Action.prototype.makeDamageValue = function (target, critical) {
    const subject = this.subject();
    const item = this.item();
    const isGunSkill = item.meta.GunSkill;

    if (subject.isActor()) {
      const weapon = subject.weapons()[0];
      if (weapon && GunData[weapon.id] && isGunSkill) {
        const ammoItemId = GunData[weapon.id].ammoItemId;
        const ammoItem = $dataItems[ammoItemId];
        if ($gameParty.numItems(ammoItem) <= 0) {
          const sfx = GunData[weapon.id].emptySound;
          if (sfx) AudioManager.playSe({ name: sfx, volume: 90, pitch: 100, pan: 0 });
          this._noAmmo = true;
          return 0;
        } else {
          $gameParty.loseItem(ammoItem, 1);
        }
      }
    }

    return _GS_makeDamageValue.call(this, target, critical);
  };

  const _GS_apply = Game_Action.prototype.apply;
  Game_Action.prototype.apply = function (target) {
    _GS_apply.call(this, target);
    if (this._noAmmo) {
      target.clearResult();
      this._noAmmo = false;
    }
  };
})();
