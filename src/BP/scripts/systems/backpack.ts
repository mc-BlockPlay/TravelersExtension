import {
    DimensionTypes,
    EntityComponent,
    EntityComponentTypes,
    EquipmentSlot,
    ItemStack,
    Player,
    system,
    world,
} from "@minecraft/server";

import { getInventory, getCursorItem, saveObjectToProperty } from "../functions/basic_functions";
import { toBackPackItem, clearBackpackData, getBackpackData, trySetArmor } from "../functions/backpack";
import { Vector2Utils, Vector3Utils } from "@minecraft/math";
import { deserializeItemStack, SerializedItemStack, serializeItemStack } from "../functions/item_serializier";

export interface BackpackItem {
    itemStack: SerializedItemStack
    slot: number
}

// Equip backpack
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const equipment = player.getComponent(EntityComponentTypes.Equippable);
        const chestItem = equipment?.getEquipment(EquipmentSlot.Chest);

        if (chestItem?.typeId !== "te:backpack") continue;

        const cursorItem = getCursorItem(player);
        if (!cursorItem) continue;

        const backpackProp = chestItem.getDynamicProperty("backpack") as string;
        const newBackpack = toBackPackItem(cursorItem, { id: player.id, property: backpackProp });

        equipment?.setEquipment(EquipmentSlot.Chest, newBackpack);
        player.getComponent(EntityComponentTypes.CursorInventory)?.clear();
    }
});

// Cleanup when backpack is unequipped
world.afterEvents.playerInventoryItemChange.subscribe(({ itemStack, slot, player }) => {
    if (!itemStack?.getDynamicProperty("currentlyEquipped")) return;

    clearBackpackData(itemStack);
    getInventory(player)?.setItem(slot, itemStack);
});

// Swap armor while backpacks
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const cursorItem = getCursorItem(player);
        if (!cursorItem?.getDynamicProperty("currentlyEquipped")) continue;

        const equipment = player.getComponent(EntityComponentTypes.Equippable);
        let chestItem = equipment?.getEquipment(EquipmentSlot.Chest);

        // Don't overwrite existing equipped backpack
        if (chestItem?.getDynamicProperty("currentlyEquipped") !== undefined) continue;

        const emptyChestplate = new ItemStack("te:empty_chestplate");
        emptyChestplate.nameTag = "§r";

        chestItem ??= emptyChestplate;

        const newBackpack = toBackPackItem(chestItem, {
            id: player.id,
            player,
            property: cursorItem.getDynamicProperty("backpack") as string,
        });

        equipment?.setEquipment(EquipmentSlot.Chest, newBackpack);
    }
});

// Handle dropped backpack iterms
system.run(() => {
    const dimensions = DimensionTypes.getAll().map(type => world.getDimension(type.typeId));

    system.runInterval(() => {
        for (const dimension of dimensions) {
            const items = dimension.getEntities({ type: "minecraft:item" });

            for (const itemEntity of items) {
                const itemComponent = itemEntity.getComponent("item");
                const itemStack = itemComponent?.itemStack;
                const playerId = itemStack?.getDynamicProperty("currentlyEquipped") as string | undefined;


                if (!itemStack || !playerId) continue;

                const player = world.getEntity(playerId) as Player;
                let backpackProp = itemStack.getDynamicProperty("backpack") as string;

                const itemInside = dimension.getEntities({ type: "minecraft:item", closest: 2, location: itemEntity.location }).filter(x => x.id != itemEntity.id)[0]

                if (itemInside && Vector3Utils.distance(itemInside.location, itemEntity.location) < 0.05) {

                    const itemInsideStack = itemInside.getComponent('item')?.itemStack

                    if (!itemInsideStack) return;
                    
                    
                    const triedSettingArmor = trySetArmor(itemInsideStack, player)
                    if (!trySetArmor) return;
                    
                    const isInsideBackpack = player.getDynamicProperty('insideBackpack')
                    
                    if (isInsideBackpack )
                        backpackProp = JSON.stringify(closeBackpack(player, itemStack));
                    else
                    if(triedSettingArmor == "Head") openBackpack(player, getBackpackData(itemStack));
                    
                    itemStack.setDynamicProperty('backpack', backpackProp)

                    if(triedSettingArmor == "Legs") {
                       const newBackpackItem = new ItemStack("te:backpack",1)
                       newBackpackItem.setDynamicProperty('backpack', backpackProp)
                       player.dimension.spawnItem(newBackpackItem, player.location)

                       itemStack.clearDynamicProperties()
                       const lore = itemStack.getLore();
                       lore.pop(); 
                       itemStack.setLore(lore);
                    }
                        
                    itemEntity.kill()
                    itemInside.kill()
                    
                    const equipment = player.getComponent("equippable");

                    
                    equipment?.setEquipment(EquipmentSlot.Chest, itemStack);

                    break;
                };

                clearBackpackData(itemStack);
                dimension.spawnItem(itemStack, itemEntity.location);
                itemEntity.kill();

                if (!player) continue;

                const equipment = player.getComponent("equippable");
                let chestItem = equipment?.getEquipment(EquipmentSlot.Chest);

                const emptyChestplate = new ItemStack("te:empty_chestplate");
                emptyChestplate.nameTag = "§r";

                chestItem ??= emptyChestplate;

                const newBackpack = toBackPackItem(chestItem, {
                    id: playerId,
                    property: backpackProp,
                });

                equipment?.setEquipment(EquipmentSlot.Chest, newBackpack);
            }
        }
    });
});

// open Backpack
function openBackpack(player: Player, backpackData: BackpackItem[]) {
    player.setDynamicProperty('insideBackpack', true)

    const inv = player.getComponent('inventory')?.container

    let playerSavedInventory = [] as BackpackItem[]

    for (let i = 9; i < 36; i++) {
        const item = inv?.getItem(i)
        if (!item) continue;
        const serializedInventoryItem = serializeItemStack(item)
        playerSavedInventory.push({ itemStack: serializedInventoryItem, slot: i })
    }

    saveObjectToProperty(player, 'inventory', playerSavedInventory)

    const backpackOpenItem = new ItemStack('barrier', 1)
    backpackOpenItem.nameTag = "insideeBP"

    for (let i = 9; i < 36; i++) {
        inv?.setItem(i)
        if (i < 23) continue
        inv?.setItem(i, backpackOpenItem)
    }
    for (const backpackedItem of backpackData) {
        inv?.setItem(backpackedItem.slot, deserializeItemStack(backpackedItem.itemStack))
    }
}
// close Backpack
function closeBackpack(player: Player, backpackItem: ItemStack) {
    player.setDynamicProperty('insideBackpack', false)

    const inv = player.getComponent('inventory')?.container

    let backpackSavedInventory = [] as BackpackItem[]

    for (let i = 9; i < 23; i++) {
        const item = inv?.getItem(i)
        if (!item) continue;
        const serializedInventoryItem = serializeItemStack(item)
        backpackSavedInventory.push({ itemStack: serializedInventoryItem, slot: i })
    }


    saveObjectToProperty(backpackItem, 'backpack', backpackSavedInventory)


    const playerItems = JSON.parse(player.getDynamicProperty('inventory') as string)

    for (let i = 9; i < 36; i++) {
        inv?.setItem(i)
    }
    for (const inventoryItems of playerItems) {
        inv?.setItem(inventoryItems.slot, deserializeItemStack(inventoryItems.itemStack))
    }

    return backpackSavedInventory
}