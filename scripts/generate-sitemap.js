const fs = require('fs')
const path = require('path')

const getAllProducts = async () => {
  try {
    // Replace localApi with fetch to make a GET request to the products API
    const response = await fetch(`https://tower-api.scoutandcellar.com/api/v2/products/sitemap`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Check if the response was successful (status 200)
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }

    // Parse the JSON response
    const result = await response.json()

    // If the API response is successful, return the product data
    if (result?.length) {
      return result
    }

    // If the response was not successful, return null
    return null
  } catch (error) {
    // Log any errors that occur and return null
    console.error(error)
    return null
  }
}

const generateSitemap = async () => {
  // Static pages for your website
  const staticPages = [
    '/order-faqs',
    '/contact',
    '/returns-and-refunds',
    '/scoutcircle',
    '/circle-choice',
    '/circle-exclusives',
  ]

  // Fetch dynamic product URLs
  const dynamicProductUrls = await getAllProducts()

  // Combine static and dynamic URLs
  const allUrls = [
    ...staticPages,
    ...dynamicProductUrls?.map(product => {
      return `/product/${product?.cartUrl}`
    }),
  ]

  // Create the XML content for the sitemap
  const sitemapXml = generateSitemapXml(allUrls)

  // Save the sitemap to the public folder
  const filePath = path.join(__dirname, '../public/sitemap.xml')
  fs.writeFileSync(filePath, sitemapXml)

  console.log('Sitemap generated at /public/sitemap.xml')
}

// Function to generate the XML structure for the sitemap
const generateSitemapXml = urls => {
  const currentDate = new Date().toISOString()
  const urlset = urls
    .map(url => {
      return `
    <url>
          <loc>https://scoutandcellar.com${url}</loc>
          <lastmod>${currentDate}</lastmod>
          <changefreq>daily</changefreq>
        </url>
      `
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urlset}
  </urlset>`
}

// Run the function to generate the sitemap
generateSitemap()
