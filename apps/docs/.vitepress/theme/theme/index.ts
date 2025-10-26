// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import './clean-style.css'
import HeroActions from './components/HeroActions.vue'
import SimpleHero from './components/SimpleHero.vue'
import Spacer from './components/Spacer.vue'
import CallToAction from './components/CallToAction.vue'
import MyLayout from './MyLayout.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'home-hero-after': () => {
        const { frontmatter } = useData()
        const components = []
        
        if (frontmatter.value.HeroActions !== undefined) {
          components.push(h(HeroActions))
        }
        
        if (frontmatter.value.Spacer !== undefined) {
          components.push(h(Spacer, { height: frontmatter.value.Spacer.height }))
        }
        
        return components.length > 0 ? components : null
      },
      'home-features-after': () => {
        const { frontmatter } = useData()
        
        if (frontmatter.value.CallToAction !== undefined) {
          return h(CallToAction, frontmatter.value.CallToAction)
        }
        
        return null
      }
    })
  },
  enhanceApp({ app, router, siteData }) {
    app.component('HeroActions', HeroActions)
    app.component('SimpleHero', SimpleHero)
    app.component('Spacer', Spacer)
    app.component('CallToAction', CallToAction)
    
    // Автоматичне розгортання активних розділів sidebar
    if (typeof window !== 'undefined') {
      const expandActiveSections = () => {
        setTimeout(() => {
          const collapsibleSections = document.querySelectorAll('.VPSidebarItem.collapsible')
          
          collapsibleSections.forEach(section => {
            const activeLink = section.querySelector('.items .link.active')
            if (activeLink) {
              const details = section.querySelector('details')
              if (details && !details.open) {
                details.open = true
              }
            }
          })
        }, 100)
      }
      
      // Функція для правильної ініціалізації теми
      const initializeTheme = () => {
        // Форсуємо перерендер соціальних іконок
        const socialLinks = document.querySelectorAll('.VPSocialLink')
        socialLinks.forEach(link => {
          link.style.opacity = '0.99'
          setTimeout(() => {
            link.style.opacity = '1'
          }, 10)
        })
      }
      
      // Розгорнути при зміні маршруту
      router.onAfterRouteChanged = () => {
        expandActiveSections()
        initializeTheme()
      }
      
      // Розгорнути при завантаженні
      document.addEventListener('DOMContentLoaded', () => {
        expandActiveSections()
        initializeTheme()
      })
      
      setTimeout(() => {
        expandActiveSections()
        initializeTheme()
      }, 300)
      
      // Слухач для зміни теми
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target as HTMLElement
            if (target.classList.contains('dark') || target === document.documentElement) {
              setTimeout(initializeTheme, 50)
            }
          }
        })
      })
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      })
    }
  }
} satisfies Theme
