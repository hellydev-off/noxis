import { reactive } from "vue";
import { player } from "@/ui/state/player";

export const demoSettings = reactive({
  // Множитель скорости (1.0 = норма)
  speed: 1.0,

  // Количество еды (поставил побольше, чтобы все быстро росли)
  pellets: 4200,

  equipment: {
    skin: player.equipment.skin,
  },

  // Размер и ценность еды
  pelletSize: 1.0,
  pelletValue: 1.2, // Еда дает чуть больше массы

  // Спавн
  // ВАЖНО: Даем игроку массу на старте, чтобы можно было сразу драться
  playerSpawnMass: 250,

  // Количество ботов (увеличил для экшена)
  botCount: 20,

  // Агрессия ботов (0..1)
  // 0.45 — они будут чаще нападать, если они больше вас
  botAggression: 0.45,
});
