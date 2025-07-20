import { EquipmentSlot, ItemStack, system, world } from "@minecraft/server";
import { PlayerStorage } from "./storage";

// Store previous equipment by player ID
const previousEquipment = new Map();

system.runInterval(() => {
    world.getAllPlayers().forEach(player => {
        const items = player.dimension.getEntities({
            location: { x: player.location.x, y: player.location.y + 0.8, z: player.location.z },
            maxDistance: 0.8,
            type: "minecraft:item"
        });
        const typeIds = items.map(item => item.getComponent('item')?.itemStack.typeId);
        console.warn(typeIds.join(", "));

        const prev = previousEquipment.get(player.id);
        const prevTypeIds = [prev?.helmet?.typeId, prev?.chest?.typeId].filter(Boolean);


        if (
            typeIds.length === 2 &&
            prevTypeIds.length === 2 &&
            typeIds.every(id => prevTypeIds.includes(id)) &&
            prevTypeIds.every(id => typeIds.includes(id))
        ) {
            player.getComponent('equippable')?.setEquipment(EquipmentSlot.Head, prev.helmet);
            player.getComponent('equippable')?.setEquipment(EquipmentSlot.Chest, prev.chest);

            for (const item of items) {
                item.kill();
            }
            if (player.getDynamicProperty('backpack_state') == true) {
                PlayerStorage.getForPlayer(player)?.closeBackpack()
            } else {
                PlayerStorage.getForPlayer(player)?.openBackpack()

            }
        }

        const helmet = player.getComponent('equippable')?.getEquipment(EquipmentSlot.Head);
        const chest = player.getComponent('equippable')?.getEquipment(EquipmentSlot.Chest);
        previousEquipment.set(player.id, { helmet, chest });
    });
});

// inside back
system.runInterval(() => {
    world.getAllPlayers().filter(x => x.getDynamicProperty('backpack_state') == true).forEach(player => {
        const inventory = player.getComponent('inventory')?.container
        if(!inventory) return;
        const dataItem = new ItemStack('barrier', 64)
        dataItem.keepOnDeath = true
        dataItem.nameTag = "insideeBP"
        inventory.setItem(35, dataItem)
        for(let i = 23; i < 35; i++) {
            inventory.setItem(i,dataItem)
        }
    });
});

// fake armor
system.runInterval(() => {
    world.getAllPlayers().forEach(player => {
      const inventory = player.getComponent('equippable')
      if(!inventory) return;
      const head = inventory.getEquipment(EquipmentSlot.Head)
          const emptyHelmet = new ItemStack('te:empty_helmet')
          emptyHelmet.nameTag = "§r"
      if(!head) inventory.setEquipment(EquipmentSlot.Head, emptyHelmet)
        const chest = inventory.getEquipment(EquipmentSlot.Chest)
    const emptyChest = new ItemStack('te:empty_chestplate')
    emptyChest.nameTag = "§r"
      if(!chest) inventory.setEquipment(EquipmentSlot.Chest, emptyChest)
        const actualInv = player.getComponent('inventory')?.container
    if(!actualInv) return;
    for(let i = 0; i < actualInv.size; i++) {
        const item = actualInv.getItem(i)
        if(!item) continue;
        if(item.typeId == "te:empty_chestplate" || item.typeId == "te:empty_helmet") actualInv.setItem(i)
    }
    const cursorInv = player.getComponent('cursor_inventory')
    if(!cursorInv?.item || (cursorInv.item.typeId != "te:empty_helmet" && cursorInv.item.typeId != "te:empty_chestplate")) return;
    cursorInv.clear()

    });
});