/*:
 * @plugindesc [FNH] Стрельба вне боя (в стиле Fear & Hunger 2) — RPG Maker MV
 * @author ChatGPT
 *
 * @param Fire Button
 * @text Кнопка стрельбы
 * @desc Название кнопки для выстрела (например: shift, control)
 * @default shift
 *
 * @param Ammo Item ID
 * @text ID предмета патрона
 * @desc ID предмета в базе данных, используемого как патрон
 * @default 10
 *
 * @param Gun Switch ID
 * @text Переключатель: Есть оружие
 * @desc Включён — можно стрелять
 * @default 302
 *
 * @param Player Projectile Event ID
 * @text ID события пули
 * @desc ID события, которое будет телепортироваться к игроку при стрельбе
 * @default 1
 *
 * @param Shoot SE
 * @text Звук выстрела
 * @desc Название SE для выстрела
 * @default Gunshot1
 *
 * @param Dry Fire SE
 * @text Щелчок без патрона
 * @desc Название SE при пустом магазине
 * @default pistol-dry-fire
 *
 * @param Animation IDs
 * @text Анимации по направлениям (вверх, вниз, влево, вправо)
 * @type struct<Animations>
 * @default {"up":"1","down":"2","left":"3","right":"4"}
 *
 * @help
 * Этот плагин реализует стрельбу вне боя, вдохновлённую Fear & Hunger 2.
 * Когда игрок нажимает заданную кнопку (например, Shift),
 * будет произведён выстрел, если есть оружие и патроны.
 * 
 * При выстреле:
 * - Играется звук
 * - Телепортируется событие-пуля к игроку
 * - Показывается анимация в направлении взгляда
 * - Тратится 1 патрон
 *
 * Настрой ID предмета патрона, переключатель, кнопку и анимации.
 */

/*~struct~Animations:
 * @param up
 * @text Вверх
 * @type number
 * @default 1
 *
 * @param down
 * @text Вниз
 * @type number
 * @default 2
 *
 * @param left
 * @text Влево
 * @type number
 * @default 3
 *
 * @param right
 * @text Вправо
 * @type number
 * @default 4
 */

(function() {
  const params = PluginManager.parameters("FNH_Shooting");
  const fireButton = params["Fire Button"] || "shift";
  const ammoItemId = Number(params["Ammo Item ID"] || 10);
  const gunSwitchId = Number(params["Gun Switch ID"] || 302);
  const arrowEventId = Number(params["Player Projectile Event ID"] || 1);
  const shootSe = params["Shoot SE"] || "Gunshot1";
  const dryFireSe = params["Dry Fire SE"] || "pistol-dry-fire";
  const anims = JSON.parse(params["Animation IDs"] || "{}");

  const animUp = Number(anims.up || 1);
  const animDown = Number(anims.down || 2);
  const animLeft = Number(anims.left || 3);
  const animRight = Number(anims.right || 4);

  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);
    if (Input.isTriggered(fireButton)) {
      attemptShoot();
    }
  };

  function attemptShoot() {
    if (!$gameSwitches.value(gunSwitchId)) return;
    if (!$gameParty.hasItem($dataItems[ammoItemId])) {
      AudioManager.playSe({name: dryFireSe, volume: 90, pitch: 100, pan: 0});
      return;
    }

    const dir = $gamePlayer.direction();
    let animId = animDown;
    if (dir === 8) animId = animUp;
    if (dir === 4) animId = animLeft;
    if (dir === 6) animId = animRight;

    $gamePlayer.requestAnimation(animId);
    $gameParty.loseItem($dataItems[ammoItemId], 1);
    AudioManager.playSe({name: shootSe, volume: 90, pitch: 100, pan: 0});

    const ev = $gameMap.event(arrowEventId);
    if (ev) {
      ev.locate($gamePlayer.x, $gamePlayer.y);
    }
  }
})();
