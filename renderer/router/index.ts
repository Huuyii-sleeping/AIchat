import { createRouter, createMemoryHistory } from "vue-router";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: "/",
      component: () => import("../views/index.vue"),
      children: [
        {
          path: "/",
          redirect: "conversation",
        },
        {
          name: 'conversation',
          path: 'conversation/:id?',
          component: () => import('../views/conversation.vue')
        },
      ],
    },
  ],
});

export default router;
