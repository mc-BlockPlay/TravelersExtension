import { Entity, EntityInventoryComponent, InputButton, ItemStack, Player, world } from "@minecraft/server";
import { SerializedItemStack, stringilizeItem, unstringilizeItem } from "../functions/convertitems";


export class PlayerStorage {
  public inventory: any;
  public backpack: any;
  public readonly player: Player;
  public readonly playerId: string;

  private static storages: Map<string, PlayerStorage> = new Map();

  constructor(player: Player) {
    this.player = player
    this.playerId = player.id;
    this.inventory = undefined;
    this.backpack = undefined;
  }

  static createForPlayer(player: Player): PlayerStorage {
    const storage = new PlayerStorage(player);
    PlayerStorage.storages.set(player.id, storage);
    return storage;
  }

  static getForPlayer(player: Player): PlayerStorage | undefined {

    return PlayerStorage.storages.get(player.id);
  }

  static removeForPlayer(player: Player): void {
    PlayerStorage.storages.delete(player.id);
  }

  openBackpack() {

    const player = this.player
    this.updateInventory()
    const inventory = player.getComponent('inventory')?.container
    if(!inventory) return;
    for (let i = 9; i < inventory.size; i++) {
      inventory.setItem(i)
    }
    for (const item of this.getBackpack()) {
      if(!item.slot) return;

      inventory?.setItem(item.slot, unstringilizeItem(item))
    }
    player.setDynamicProperty('backpack_state', true)
  }

  closeBackpack() {
    const player = this.player
    this.updateBackpack()
    const inventory = player.getComponent('inventory')?.container
    if(!inventory) return;
    for (let i = 9; i < inventory.size; i++) {
      inventory.setItem(i)
    }
    for (const item of this.getInventory()) {
      if(!item.slot) return;
      inventory?.setItem(item.slot, unstringilizeItem(item))
    }
    player.setDynamicProperty('backpack_state', false)
  }

  updateInventory(): void {
    const player = this.player
    const newInventory = player.getComponent('inventory')
    if (!newInventory) return;
    let stringilizedInventory: any = [];
    const container = newInventory.container;
    for (let i = 9; i < container.size; i++) {
      const item = container.getItem(i);
      if (!item) continue
      const stringilizedItem = stringilizeItem(item)
      stringilizedItem.slot = i
      stringilizedInventory.push(stringilizedItem);
    }

    player.setDynamicProperty('inventory', JSON.stringify(stringilizedInventory))
    this.inventory = stringilizedInventory;
  }

  getInventory(): SerializedItemStack[] {
    if (!Array.isArray(this.inventory)) {
      const inv = this.player.getDynamicProperty('inventory');

      return JSON.parse(typeof inv === "string" ? inv : "[]");
    }
    return this.inventory;
  }

  getBackpack(): SerializedItemStack[] {
    if (!Array.isArray(this.backpack)) {
      const inv = this.player.getDynamicProperty('backpack');
      return JSON.parse(typeof inv === "string" ? inv : "[]");
    }
    return this.backpack;
  }

  updateBackpack(): void {
    const player = this.player
    const newInventory = player.getComponent('inventory')
    if (!newInventory) return;
    let stringilizedInventory: any = [];
    const container = newInventory.container;
    for (let i = 9; i < container.size-13; i++) {
      const item = container.getItem(i);
      if (!item) continue
      const stringilizedItem = stringilizeItem(item)
      stringilizedItem.slot = i
      stringilizedInventory.push(stringilizedItem);
    }
    player.setDynamicProperty('backpack', JSON.stringify(stringilizedInventory))
    this.backpack = stringilizedInventory;
  }
}
