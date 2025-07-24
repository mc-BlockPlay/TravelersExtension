import { ContainerSlot, EnchantmentTypes, ItemStack } from "@minecraft/server";

export interface SerializedItemStack {
    typeId: string;
    amount: number;
    dynamicProperties?: { id: string, value: any }[];
    lore?: string[];
    nameTag?: string;
    placeOnBlocks?: string[];
    damage?: number;
    enchantments?: { type: string, level: number }[];

}
export type SerializedItemStackTemplate = Omit<SerializedItemStack, "typeId">;

export function serializeItemStack(itemStack: ItemStack | ContainerSlot): SerializedItemStack {
    if (itemStack instanceof ContainerSlot) {
        itemStack = itemStack.getItem() as ItemStack
    }
    const baseStack: SerializedItemStack = {
        typeId: itemStack.typeId,
        nameTag: itemStack.nameTag,
        amount: itemStack.amount,
        lore: undefined,
        placeOnBlocks: undefined,
        dynamicProperties: undefined
    }

    const itemStackLores = itemStack.getLore()
    if (itemStackLores.length > 0) {
        baseStack.lore = itemStackLores
    }

    const placeOnBlocks = itemStack.getCanPlaceOn()
    if (placeOnBlocks.length > 0) {
        baseStack.placeOnBlocks = placeOnBlocks
    }

    const dynamicProperties = itemStack.getDynamicPropertyIds()
    if (dynamicProperties.length > 0) {
        baseStack.dynamicProperties = dynamicProperties.map(id => ({ id, value: itemStack.getDynamicProperty(id) }))
    }

    const durabilityComp = itemStack.getComponent("durability")
    if (durabilityComp) {
        baseStack.damage = durabilityComp.damage
    }

    const enchantComp = itemStack.getComponent("enchantable")
    if (enchantComp) {
        baseStack.enchantments = enchantComp.getEnchantments().map(enchantment => {
            return {
                type: enchantment.type.id,
                level: enchantment.level
            }
        })
    }

    return baseStack
}

export function deserializeItemStack(serialized: SerializedItemStack): ItemStack | undefined {
    try {
        const itemStack = new ItemStack(serialized.typeId, serialized.amount);
        itemStack.nameTag = serialized.nameTag;
        itemStack.setLore(serialized.lore);

        serialized.dynamicProperties?.forEach(property => {
            itemStack.setDynamicProperty(property.id, property.value);
        });

        const durabilityComp = itemStack.getComponent("durability")
        if (durabilityComp && serialized.damage) {
            durabilityComp.damage = serialized.damage;
        }

        itemStack.setCanPlaceOn(serialized.placeOnBlocks);

        const enchantComp = itemStack.getComponent("enchantable")
        if (enchantComp && serialized.enchantments) {
            serialized.enchantments.forEach(enchantment => {
                const type = EnchantmentTypes.get(enchantment.type)!
                const enchLevel = Math.max(Math.min(enchantment.level, type.maxLevel), 1);

                if (enchantment.level > type.maxLevel) {
                    console.warn(`Enchantment level ${enchantment.level} exceeds max level ${type.maxLevel} for type ${enchantment.type}. Clamping to max level.`);
                }

                enchantComp.addEnchantment({ type: type, level: enchLevel });
            });
        }

        return itemStack;
    } catch (error) {
        return undefined;
    }
}
