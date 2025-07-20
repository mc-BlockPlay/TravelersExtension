import { EntityEquippableComponent, EquipmentSlot, ItemTypes, Player, system, world } from "@minecraft/server";
import { PlayerStorage } from "./systems/storage";
import { unstringilizeItem } from "./functions/convertitems";

import './systems/handlebackpack'
import { ActionFormData } from "@minecraft/server-ui";

system.run(() => {
    console.warn( ItemTypes.getAll().length * (15**2-1)	)

    for (const player of world.getAllPlayers()) {
        if(PlayerStorage.getForPlayer(player)) return;
        PlayerStorage.createForPlayer(player)
    }
})

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    if (!initialSpawn) return;
    if(PlayerStorage.getForPlayer(player)) return;

    PlayerStorage.createForPlayer(player)
})

world.afterEvents.playerBreakBlock.subscribe(({player}) => {
 const form = new ActionFormData()
 form.title('Custom Form')
 form.button(ItemTypes.getAll()[259].id, `${(260)*65536}`)    
 form.show(player)
})