export const landingPageTemplates = [
  {
    id: 'food-beverages',
    name: 'Food & Beverages',
    blocks: [
      { type: 'hero', content: { logo: '', title: 'Welcome to [Brand]', subtitle: 'Delicious food delivered to you', image: '/dummy/food-hero.jpg' } },
      { type: 'products', content: { title: 'Our Menu', products: [
        { name: 'Pizza Margherita', image: '/dummy/pizza.jpg', price: '₹299', link: '#' },
        { name: 'Veg Burger', image: '/dummy/burger.jpg', price: '₹149', link: '#' }
      ]}},
      { type: 'products', content: { title: 'Top Selling', products: [
        { name: 'Pasta Alfredo', image: '/dummy/pasta.jpg', price: '₹199', link: '#' }
      ]}},
      { type: 'links', content: { title: 'Order on', links: [
        { name: 'Swiggy', image: '/dummy/swiggy.png', url: '#' },
        { name: 'Zomato', image: '/dummy/zomato.png', url: '#' }
      ]}},
      { type: 'testimonials', content: { testimonials: [
        { text: 'Amazing taste!', author: 'Ravi' },
        { text: 'Quick delivery!', author: 'Priya' }
      ]}},
      { type: 'contact form', content: { fields: ['name', 'email', 'message'], submitText: 'Send' }}
    ]
  },
  {
    id: 'fashion-apparel',
    name: 'Fashion & Apparel',
    blocks: [
      { type: 'hero', content: { logo: '', title: 'Discover Your Style', subtitle: 'Trendy fashion for everyone', image: '/dummy/fashion-hero.jpg' } },
      { type: 'products', content: { title: 'New Arrivals', products: [
        { name: 'Summer Dress', image: '/dummy/dress.jpg', price: '₹999', link: '#' },
        { name: 'Denim Jacket', image: '/dummy/jacket.jpg', price: '₹1499', link: '#' }
      ]}},
      { type: 'gallery', content: { title: 'Gallery', images: [
        { src: '/dummy/fashion1.jpg', alt: 'Look 1' },
        { src: '/dummy/fashion2.jpg', alt: 'Look 2' }
      ]}},
      { type: 'testimonials', content: { testimonials: [
        { text: 'Love the quality!', author: 'Ayesha' },
        { text: 'Fast shipping!', author: 'Rahul' }
      ]}},
      { type: 'contact form', content: { fields: ['name', 'email', 'message'], submitText: 'Send' }}
    ]
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    blocks: [
      { type: 'hero', content: { logo: '', title: 'Feel Your Best', subtitle: 'Supplements & wellness products', image: '/dummy/health-hero.jpg' } },
      { type: 'products', content: { title: 'Featured Products', products: [
        { name: 'Vitamin C Tablets', image: '/dummy/vitamin-c.jpg', price: '₹299', link: '#' },
        { name: 'Protein Powder', image: '/dummy/protein.jpg', price: '₹799', link: '#' }
      ]}},
      { type: 'benefits', content: { title: 'Why Choose Us?', benefits: [
        { icon: '💪', text: 'Boosts Immunity' },
        { icon: '🌱', text: 'Natural Ingredients' }
      ]}},
      { type: 'testimonials', content: { testimonials: [
        { text: 'Great results!', author: 'Sonia' },
        { text: 'Highly recommend!', author: 'Amit' }
      ]}},
      { type: 'contact form', content: { fields: ['name', 'email', 'message'], submitText: 'Send' }}
    ]
  },
  {
    id: 'electronics-gadgets',
    name: 'Electronics & Gadgets',
    blocks: [
      { type: 'hero', content: { logo: '', title: 'Smart Tech for You', subtitle: 'Latest gadgets & electronics', image: '/dummy/electronics-hero.jpg' } },
      { type: 'products', content: { title: 'Latest Gadgets', products: [
        { name: 'Smart Watch', image: '/dummy/watch.jpg', price: '₹1999', link: '#' },
        { name: 'Wireless Earbuds', image: '/dummy/earbuds.jpg', price: '₹1499', link: '#' }
      ]}},
      { type: 'features', content: { title: 'Key Features', features: [
        { icon: '🔋', text: 'Long Battery Life' },
        { icon: '📱', text: 'Mobile App Control' }
      ]}},
      { type: 'testimonials', content: { testimonials: [
        { text: 'Superb quality!', author: 'Neha' },
        { text: 'Value for money!', author: 'Arjun' }
      ]}},
      { type: 'contact form', content: { fields: ['name', 'email', 'message'], submitText: 'Send' }}
    ]
  }
]; 