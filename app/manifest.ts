import { MetadataRoute } from 'next'

// export default function manifest(): MetadataRoute.Manifest {
//   return {
//     name: 'Amaury Pichat - Consultant GED',
//     short_name: 'AP Consultant',
//     description: 'Expert en solutions GED et Documentum',
//     start_url: '/',
//     display: 'standalone',
//     background_color: '#ffffff',
//     theme_color: '#3b82f6',
//     icons: [
//       {
//         src: '/icons/icon-192x192.png',
//         sizes: '192x192',
//         type: 'image/png'
//       },
//       {
//         src: '/icons/icon-512x512.png',
//         sizes: '512x512',
//         type: 'image/png'
//       }
//     ]
//   }
// } 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Amaury Pichat - Consultant GED',
    short_name: 'AP Consultant',
    description: 'Expert en solutions GED et Documentum',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/next.svg',
        sizes: '192x192',
        type: 'image/svg'
      }
      // {
      //   src: '/icons/icon-512x512.png',
      //   sizes: '512x512',
      //   type: 'image/png'
      // }
    ]
  }
} 
 