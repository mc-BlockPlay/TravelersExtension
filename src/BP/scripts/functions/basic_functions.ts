import { EntityComponentTypes, ItemStack, Player } from "@minecraft/server";

export function getInventory(player: Player) {
    return player.getComponent("inventory")?.container;
}

export function saveObjectToProperty(towhom: Player | ItemStack, property: string, data: {} | []): undefined {
    towhom.setDynamicProperty(property, JSON.stringify(data))
}

export function getCursorItem(player: Player): ItemStack | undefined {
    return player.getComponent(EntityComponentTypes.CursorInventory)?.item;
}