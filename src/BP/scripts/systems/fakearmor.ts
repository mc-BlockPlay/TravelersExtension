import {
  system,
  world,
  EquipmentSlot,
  ItemStack,
  EntityComponentTypes,
} from "@minecraft/server";

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const equipment = player.getComponent(EntityComponentTypes.Equippable);
    if (!equipment) continue;

    // Ensure Head slot has default helmet if empty
    const helmet = equipment.getEquipment(EquipmentSlot.Head);
    if (!helmet) {
      const defaultHelmet = new ItemStack("te:empty_helmet");
      defaultHelmet.nameTag = "§r";
      equipment.setEquipment(EquipmentSlot.Head, defaultHelmet);
    }

    // Ensure Chest slot has default chestplate if empty
    const chestplate = equipment.getEquipment(EquipmentSlot.Chest);
    if (!chestplate) {
      const defaultChest = new ItemStack("te:empty_chestplate");
      defaultChest.nameTag = "§r";
      equipment.setEquipment(EquipmentSlot.Chest, defaultChest);
    }

    // Ensure Leggings slot has default leggings if empty
    const leggings = equipment.getEquipment(EquipmentSlot.Legs);
    if (!leggings) {
      const defaultLeggings = new ItemStack("te:empty_leggings");
      defaultLeggings.nameTag = "§r";
      equipment.setEquipment(EquipmentSlot.Legs, defaultLeggings);
    }

    // Ensure Boots slot has default boots if empty
    const boots = equipment.getEquipment(EquipmentSlot.Feet);
    if (!boots) {
      const defaultBoots = new ItemStack("te:empty_boots");
      defaultBoots.nameTag = "§r";
      equipment.setEquipment(EquipmentSlot.Feet, defaultBoots);
    }

    // Remove empty armor items from inventory
    const inventory = player.getComponent("inventory")?.container;
    if (!inventory) continue;

    for (let i = 0; i < inventory.size; i++) {
      const item = inventory.getItem(i);
      if (
        item?.typeId === "te:empty_helmet" ||
        item?.typeId === "te:empty_chestplate" ||
        item?.typeId === "te:empty_leggings" ||
        item?.typeId === "te:empty_boots"
      ) {
        inventory.setItem(i);
      }
    }

    // Clear empty armor from cursor
    const cursor = player.getComponent("cursor_inventory");
    const cursorItem = cursor?.item;
    if (
      cursorItem &&
      (cursorItem.typeId === "te:empty_helmet" ||
        cursorItem.typeId === "te:empty_chestplate" ||
        cursorItem.typeId === "te:empty_leggings" ||
        cursorItem.typeId === "te:empty_boots")
    ) {
      cursor.clear();
    }
  }
});
