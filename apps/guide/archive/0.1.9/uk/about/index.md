<script setup>
import { VPTeamMembers } from 'vitepress/theme'
import { onMounted } from 'vue'

const avatars = ['/rastgame.jpg', '/rastgame.jpeg']

const members = [
  {
    avatar: avatars[Math.floor(Math.random() * avatars.length)],
    name: 'RastGame',
    title: 'Founder | developer | tester | others..',
    links: [
      { icon: 'github', link: 'https://github.com/rastgame' },
      { icon: 'https://yurba.js.org/icons/yurba.svg', link: 'https://github.com/rastgame' }
    ]
  }
]

</script>

# Про Yurba.js

## Команда

<VPTeamMembers size="small" :members />

На цей момент весь проєкт створений, підтримується та розроблюється засновником - [RastGame](https://github.com/rastgame).

## Мета

Наша мета проста: надати розробникам, які працюють з api.yurba.one, зручну та просту бібліотеку з усім необхідним функціоналом. Ця бібліотека призначена не лише для розробників ботів, але й для всіх, хто потребує інтеграції з api.yurba.one. Саме тому всі пакети є незалежними: [REST](https://github.com/yurbajs/yurba.js/tree/main/packages/rest) призначений виключно для роботи з API Yurba, а основна бібліотека [Yurba.js](https://github.com/yurbajs/yurba.js/tree/main/packages/yurba.js) — для створення ботів. Ми віримо в:

- **Простоту** - Робимо розробку ботів доступною для розробників будь-якого рівня
- **Продуктивність** - Забезпечуємо швидкість та ефективність нашої бібліотеки
- **Надійність** - Створюємо стабільні інструменти, на які можуть покладатися розробники
- **Спільноту** - Розвиваємо повністю відкритий проєкт, де [весь код доступний для перегляду](https://github.com/yurbajs) з ліцензією [Apache 2.0](https://github.com/yurbajs/yurba.js/blob/main/LICENSE) та [кожен може запропонувати своє рішення щодо проблем](https://github.com/yurbajs/yurba.js/issues) або [покращення коду](https://github.com/yurbajs/yurba.js/pulls)

## Історія

З самого початку бібліотека була створена як клієнт для Yurba, але з часом це перетворилося на повноцінний monorepo проєкт [зі своїми пакетами](https://github.com/yurbajs/yurba.js?tab=readme-ov-file#packages), [гайдом](https://yurba.js.org/) та [документацією](https://yurba.js.org/docs)

## Участь у розробці

Ми вітаємо внески від спільноти! Незалежно від того, чи виправляєте помилки, покращуєте документацію чи пропонуєте нові функції, ваша допомога цінується. Перегляньте наш [Посібник з участі](https://github.com/yurbajs/yurba.js/blob/main/CONTRIBUTING.md), щоб почати.

## Підтримка

Якщо вам потрібна допомога з Yurba.js, є кілька способів отримати підтримку:

- Приєднуйтесь до нашого [Чату](https://me.yurba.one/yurba.js) для допомоги в реальному часі
- Перевірте [Документацію](https://yurba.js.org/docs) для посібників та довідників API
- Відкрийте [Issue](https://github.com/yurbajs/yurba.js/issues) на GitHub для повідомлень про помилки або запитів на нові функції

## Ліцензія

Yurba.js ліцензований повністю під ліцензію [Apache 2.0](https://github.com/yurbajs/yurba.js/blob/main/LICENSE) без виключення.