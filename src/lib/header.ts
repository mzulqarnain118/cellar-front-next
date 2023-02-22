import type { Client, Content } from '@prismicio/client'

const graphQuery = `{
  navigation_menu {
    body {
      ...on navigation_link {
        non-repeat {
          ...non-repeatFields
        }
        repeat {
          child_link {
            ...on navigation_menu {
              body {
                ...on navigation_link {
                  non-repeat {
                    ...non-repeatFields
                  }
                  repeat {
                    ...repeatFields
                  }
                }
              }
            }
          }
          child_name
        }
      }
    }
  }
}`

export const getNavigation = (client: Client<Content.AllDocumentTypes>) =>
  client.getByUID<Content.NavigationMenuDocument>('navigation_menu', 'header', {
    graphQuery,
  })
