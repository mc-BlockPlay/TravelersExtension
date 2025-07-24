import { EntityComponentTypes, EquipmentSlot, ItemStack, Player } from "@minecraft/server";
import { BackpackItem } from "../systems/backpack";

interface BackpackItemData {
    property?: string,
    id: string,
    player?: Player
}

export function trySetArmor(item:ItemStack, player:Player) {
    const equippable = player.getComponent(EntityComponentTypes.Equippable)
    if(equippable?.setEquipment(EquipmentSlot.Head, item)) return "Head";
    if(equippable?.setEquipment(EquipmentSlot.Chest, item)) return "Chest"
    if(equippable?.setEquipment(EquipmentSlot.Legs, item)) return "Legs"
    if(equippable?.setEquipment(EquipmentSlot.Feet, item)) return "Feet"
    return false
}

export function toBackPackItem(item: ItemStack, data: BackpackItemData) {
    const { id, player, property } = data
    item.setDynamicProperty('currentlyEquipped', id)
    item.setDynamicProperty('backpack', property ?? "[]")
    item.setLore([...item.getLore(), "§b§a§c§k§p§a§c§k"])
    return item
}

export function getBackpackData(item:ItemStack) {
    const data = JSON.parse(item.getDynamicProperty('backpack') as string) as BackpackItem[]
    return data
}

export function clearBackpackData(item: ItemStack): void {
    item.clearDynamicProperties();
    item.setLore(item.getLore().slice(0, -1));
}

