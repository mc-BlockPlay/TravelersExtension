import { Enchantment, EnchantmentType, EnchantmentTypes, ItemStack } from "@minecraft/server";

export interface stringilizedEnchantment {
  type: string;
  level: number;
}


export interface SerializedItemStack {
  typeId: string;
  amount: number;
  dynamicProperties?: { id: string, value: any }[];
  lore?: string[];
  nameTag?: string;
  placeOnBlocks?: string[];
  slot?: number;
  enchants?: stringilizedEnchantment[];
  durability?: number
}

export function stringilizeItem(item: ItemStack): SerializedItemStack {
  const baseStack: SerializedItemStack = {
    typeId: item.typeId,
    nameTag: item.nameTag,
    amount: item.amount,
    lore: undefined,
    placeOnBlocks: undefined,
    dynamicProperties: undefined,
    slot: undefined,
    enchants: [],
    durability: undefined
  };

const itemStackLores = item.getLore()
if (itemStackLores.length > 0) {
    baseStack.lore = itemStackLores
}

const placeOnBlocks = item.getCanPlaceOn()
if (placeOnBlocks.length > 0) {
    baseStack.placeOnBlocks = placeOnBlocks
}

const dynamicProperties = item.getDynamicPropertyIds()
if (dynamicProperties.length > 0) {
    baseStack.dynamicProperties = dynamicProperties.map(id => ({ id, value: item.getDynamicProperty(id) }))
}

if (item.hasComponent("minecraft:enchantable")) {
  const enchantable = item.getComponent("minecraft:enchantable");
  if (enchantable) {
    baseStack.enchants = enchantable.getEnchantments().map((e) => ({ type: e.type.id, level: e.level }));
  }
}
if (item.hasComponent("minecraft:durability")) {
  const durability = item.getComponent("minecraft:durability");
  if (durability) {
    baseStack.durability = durability.damage;
  }
}


return baseStack
}


export function unstringilizeItem(serialized: SerializedItemStack) {
  const itemStack = new ItemStack(serialized.typeId, serialized.amount);
  itemStack.nameTag = serialized.nameTag;
  if (serialized.lore) itemStack.setLore(serialized.lore);

  serialized.dynamicProperties?.forEach(property => {
      itemStack.setDynamicProperty(property.id, property.value);
  });
  if (serialized.enchants) {
    const enchantable = itemStack.getComponent("minecraft:enchantable");
    if (enchantable) {
      enchantable.addEnchantments(
        serialized.enchants.map((e) => ({
          ...e,
          type: new EnchantmentType(e.type),
        }))
      );
    }
  }
  if(serialized.durability) {
    if (itemStack.hasComponent("minecraft:durability")) {
      const durability = itemStack.getComponent("minecraft:durability");
      if (durability) {
        durability.damage = serialized.durability;
      }
    }
  }
  if (serialized.placeOnBlocks) itemStack.setCanPlaceOn(serialized.placeOnBlocks);
  return itemStack;
}