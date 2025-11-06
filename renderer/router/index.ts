import { createRouter, createMemoryHistory } from "vue-router";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: "/",
      component: () => import("../views/index.vue"),
    },
  ],
});


export default router