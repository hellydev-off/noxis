import { reactive, onMounted, ref } from "vue";

export const player = reactive({
  username: "Helly",
  level: 27,
  currency: 1480,
  premium: 260,
  equipment: {
    skin: "http://localhost:3000/static/5f98ba2e-70e5-4ae3-b989-e1352b87dc3e.png ",
  },
  skins: [],
  boosters: [],
  abilities: [],
  lootBoxes: [],
  premium: [],
});
