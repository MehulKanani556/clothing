import { useState, useEffect, useRef, Fragment } from 'react'
import { Disclosure, DisclosureButton, Menu, MenuButton, MenuItem, MenuItems, DisclosurePanel, Transition, Dialog, DialogPanel, TransitionChild } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useDispatch, useSelector } from 'react-redux';
import AuthModal from './AuthModal';
import { logout } from '../redux/slice/auth.slice';
import { fetchCart } from '../redux/slice/cart.slice';
import { fetchCategories, fetchSubCategories, fetchMainCategories } from '../redux/slice/category.slice';
import { fetchProducts } from '../redux/slice/product.slice';
import { fetchWishlist } from '../redux/slice/wishlist.slice';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdKeyboardArrowDown, MdLogout, MdPerson, MdSettings } from 'react-icons/md';
import { FiSearch, FiX } from 'react-icons/fi';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Header() {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { mainCategories, categories, subCategories } = useSelector((state) => state.category);
  const dropdownRef = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const name = user?.firstName + ' ' + user?.lastName;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dispatch = useDispatch();
  const { items: cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { products } = useSelector((state) => state.product);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
    dispatch(fetchProducts({}));
    dispatch(fetchMainCategories());
    dispatch(fetchCategories());
    dispatch(fetchSubCategories());
  }, [isAuthenticated, dispatch, user]);

  // Static images map for styling (optional: could come from backend images if available)
  const categoryImages = {
    'Men': [
      { name: 'New Arrivals', url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=2187&auto=format&fit=crop', href: '/category/men' },
      { name: 'Best Sellers', url: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=2187&auto=format&fit=crop', href: '/category/men' }
    ],
    'Women': [
      { name: 'New Arrival', url: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=2235&auto=format&fit=crop', href: '/category/women' },
      { name: 'Best Sellers', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=2187&auto=format&fit=crop', href: '/category/women' },
      { name: 'Top Rated', url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=2187&auto=format&fit=crop', href: '/category/women' }
    ],
    'Premium': [
      { name: 'Oversized T shirts', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2264&auto=format&fit=crop', href: '/category/premium' },
      { name: 'Bottom wear', url: 'https://images.unsplash.com/photo-1542272617-08f086302542?q=80&w=2187&auto=format&fit=crop', href: '/category/premium' }
    ]
  };

  // Organize categories and subcategories by 4-level hierarchy
  const organizeNavigation = (mainCatId) => {
    // Get categories under this main category
    const mainCatCategories = categories.filter(cat =>
      cat.mainCategory &&
      (cat.mainCategory._id === mainCatId || cat.mainCategory === mainCatId) &&
      !cat.deletedAt &&
      cat.isActive
    );

    // Organize: Group subcategories under their parent categories
    const columns = mainCatCategories.map(category => {
      // Get subcategories for this category
      const categorySubs = subCategories.filter(sub =>
        sub.category &&
        (sub.category._id === category._id || sub.category === category._id) &&
        !sub.deletedAt &&
        sub.isActive
      ).map(sub => ({
        name: sub.name,
        slug: sub.slug || sub.name.toLowerCase().replace(/\s+/g, '-')
      }));

      return {
        heading: category.name, // Category name (Topwear, Bottomwear, etc.)
        items: categorySubs // SubCategory items (T-Shirts, Jeans, etc.)
      };
    }).filter(col => col.items.length > 0); // Only include columns with items

    return columns;
  };

  const navigation = [
    ...mainCategories
      .filter(mainCat => mainCat.isActive && !mainCat.deletedAt)
      .sort((a, b) => {
        // Sort by main category name: Men, Women, Kids, etc.
        const order = { 'Men': 1, 'Women': 2, 'Kids': 3 };
        return (order[a.name] || 99) - (order[b.name] || 99);
      })
      .map(mainCat => {
        // Organize categories and subcategories for this main category
        const columns = organizeNavigation(mainCat._id);

        return {
          name: mainCat.name, // Level 1: Men, Women, Kids (MainCategory)
          href: `/${mainCat.slug || mainCat.name.toLowerCase()}`,
          slug: mainCat.slug,
          type: 'dropdown',
          columns: columns, // Category (Topwear) -> SubCategory (T-Shirts, Jeans)
          images: categoryImages[mainCat.name] || []
        };
      }),
    { name: 'Best Sellers', href: '/best-sellers' }
  ];

  // Dynamic Search Logic
  const uniqueCategories = [...new Set(products.map(p => p.category?.name || p.category).filter(Boolean))];
  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  const trendingTags = subCategories && subCategories.length > 0
    ? subCategories.slice(0, 8).map(s => s.name)
    : ['T-Shirts', 'Jeans'];

  const popularBrands = uniqueBrands.length > 0
    ? uniqueBrands.slice(0, 8)
    : ['Levi\'s', 'Nike', 'Puma'];

  const searchSuggestions = [...uniqueCategories, ...uniqueBrands].slice(0, 10);

  // Filter Logic
  const filteredSuggestions = searchQuery
    ? searchSuggestions.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchSuggestions;

  const filteredProducts = searchQuery
    ? products.filter(item =>
      (item.name || item.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category?.name || item.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    : products;

  const hasResults = filteredSuggestions.length > 0 || filteredProducts.length > 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/all-products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      setIsProfileOpen(false);
    }
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getProductDisplay = (product) => {
    const variant = product.variants?.[0];
    const option = variant?.options?.[0];

    const price = product.price || option?.price || 0;
    const originalPrice = product.originalPrice || option?.mrp || 0;
    const image = product.image || variant?.images?.[0] || '';

    const discount = product.discount || (price && originalPrice ? `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF` : null);
    const rating = product.averageRating || (typeof product.rating === 'number' ? product.rating : 0) || 0;

    return {
      id: product.id || product._id,
      title: product.title || product.name,
      price,
      originalPrice,
      image,
      discount,
      rating
    };
  };

  return (
    <Disclosure
      as="nav"
      className="relative shadow sticky top-0 bg-white z-50 dark:bg-white-800/50 dark:after:pointer-events-none dark:after:absolute dark:after:inset-x-0 dark:after:bottom-0 dark:after:h-px dark:after:bg-white/10"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <Link to="/" className="flex shrink-0 items-center text-2xl font-bold text-black  w-[125px] ">
              <img className='' src={require('../assets/image/logo_in_one_line.png')}  alt='LOGO' />
            </Link>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex gap-3 space-x-4 h-full items-center">
                {navigation.map((item) => {
                  if (item.type === 'dropdown') {
                    return (
                      <div key={item.name} className="group relative h-full flex items-center">
                        <Link
                          to={item.href}
                          className={classNames(
                            location.pathname.startsWith(item.href) || (item.slug && location.pathname.split('/').includes(item.slug))
                              ? 'font-bold border-b-2 border-black hover:border-b-2 hover:border-black'
                              : 'font-regular',
                            'px-1 py-2 text-sm text-black group-hover:text-black transition-colors inline-flex items-center gap-1 z-10',
                          )}
                        >
                          {item.name}
                          <MdKeyboardArrowDown className="transition-transform duration-200 group-hover:rotate-180" />
                        </Link>

                        {/* Mega Menu / Dropdown - Content Sized */}
                        {item.columns.length > 0 && (
                          <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out z-50">
                            <div className="bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden w-max">
                              <div className="p-8">
                                <div className="flex gap-12">
                                  {item.columns.map((col, idx) => (
                                    <div key={col.heading || idx} className="flex flex-col min-w-[140px]">
                                      {col.heading && (
                                        <h3 className="font-bold text-black mb-4 text-sm uppercase tracking-wide border-b border-gray-100 pb-2">
                                          {col.heading}
                                        </h3>
                                      )}
                                      <ul className="space-y-3 flex-1">
                                        {col.items.map((subItem) => (
                                          <li key={typeof subItem === 'string' ? subItem : subItem.name || subItem}>
                                            <Link
                                              to={`/${typeof subItem === 'string' ? subItem.toLowerCase().replace(/\s+/g, '-') : (subItem.slug || subItem.name?.toLowerCase().replace(/\s+/g, '-'))}`}
                                              className="text-sm text-gray-500 hover:text-black hover:translate-x-1 transition-all block"
                                            >
                                              {typeof subItem === 'string' ? subItem : (subItem.name || subItem)}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        location.pathname === item.href
                          ? 'font-bold border-b-2 border-black'
                          : 'font-regular',
                        ' px-1 py-2 text-sm text-black',
                      )}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center gap-3 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="relative rounded-full p-1 text-black focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500 hover:bg-gray-100 transition-colors"
            >
              <span className="sr-only">Search</span>
              <FiSearch size={22} />
            </button>
            <Link
              to="/wishlist"
              className="relative rounded-full p-1  text-black focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500 "
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">View wishlist</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[20px] h-[20px]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              {wishlistItems?.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link
              id="cart-icon"
              to="/cart"
              className="relative rounded-full p-1  text-black focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500 dark:hover:text-white"
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">View notifications</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 26 26" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M20.7797 9.04551L21.6463 22.0455C21.6681 22.3784 21.6214 22.7123 21.5091 23.0265C21.3967 23.3406 21.2212 23.6285 20.9933 23.8721C20.7653 24.1158 20.4899 24.3101 20.1839 24.4431C19.8779 24.5762 19.5479 24.645 19.2143 24.6455H6.43743C6.10369 24.6454 5.77354 24.5767 5.46741 24.4438C5.16127 24.3109 4.88568 24.1165 4.6577 23.8728C4.42971 23.6291 4.25418 23.3411 4.14197 23.0268C4.02976 22.7125 3.98326 22.3785 4.00535 22.0455L4.87201 9.04551C4.91324 8.42855 5.1874 7.85031 5.63896 7.42791C6.09053 7.0055 6.68576 6.77051 7.3041 6.77051H18.3476C18.9659 6.77051 19.5612 7.0055 20.0127 7.42791C20.4643 7.85031 20.7385 8.42855 20.7797 9.04551ZM19.1579 9.15384C19.1442 8.94825 19.0529 8.75556 18.9024 8.61476C18.752 8.47397 18.5536 8.3956 18.3476 8.39551H7.3041C7.09805 8.3956 6.89973 8.47397 6.74928 8.61476C6.59884 8.75556 6.5075 8.94825 6.49377 9.15384L5.6271 22.1538C5.61936 22.2649 5.63459 22.3764 5.67183 22.4813C5.70907 22.5862 5.76753 22.6823 5.84356 22.7636C5.9196 22.8449 6.01157 22.9097 6.11374 22.9539C6.21592 22.9981 6.32611 23.0208 6.43743 23.0205H19.2143C19.3256 23.0208 19.4358 22.9981 19.538 22.9539C19.6401 22.9097 19.7321 22.8449 19.8081 22.7636C19.8842 22.6823 19.9426 22.5862 19.9799 22.4813C20.0171 22.3764 20.0323 22.2649 20.0246 22.1538L19.1579 9.15384Z" fill="#141414" />
                <path fillRule="evenodd" clipRule="evenodd" d="M17.431 7.58317C17.431 7.79866 17.3454 8.00532 17.193 8.1577C17.0406 8.31007 16.834 8.39567 16.6185 8.39567C16.403 8.39567 16.1963 8.31007 16.044 8.1577C15.8916 8.00532 15.806 7.79866 15.806 7.58317V5.95817C15.806 5.16805 15.4921 4.41028 14.9334 3.85158C14.3747 3.29288 13.6169 2.979 12.8268 2.979C12.0367 2.979 11.2789 3.29288 10.7202 3.85158C10.1615 4.41028 9.84766 5.16805 9.84766 5.95817V7.58317C9.84766 7.79866 9.76205 8.00532 9.60968 8.1577C9.45731 8.31007 9.25064 8.39567 9.03516 8.39567C8.81967 8.39567 8.61301 8.31007 8.46063 8.1577C8.30826 8.00532 8.22266 7.79866 8.22266 7.58317V5.95817C8.22266 4.73707 8.70774 3.56598 9.57119 2.70253C10.4346 1.83908 11.6057 1.354 12.8268 1.354C14.0479 1.354 15.219 1.83908 16.0825 2.70253C16.9459 3.56598 17.431 4.73707 17.431 5.95817V7.58317ZM15.52 11.5677C15.5658 11.4713 15.6301 11.3849 15.7094 11.3134C15.7886 11.2418 15.8811 11.1866 15.9816 11.1509C16.0822 11.1151 16.1888 11.0995 16.2954 11.1049C16.4019 11.1104 16.5064 11.1367 16.6028 11.1825C16.6992 11.2284 16.7856 11.2927 16.8571 11.3719C16.9286 11.4511 16.9838 11.5436 17.0196 11.6442C17.0554 11.7447 17.071 11.8513 17.0655 11.9579C17.0601 12.0645 17.0337 12.169 16.9879 12.2653C16.6148 13.0532 16.0256 13.7189 15.289 14.1851C14.5524 14.6513 13.6986 14.8988 12.8268 14.8988C11.9551 14.8988 11.1012 14.6513 10.3646 14.1851C9.62801 13.7189 9.03887 13.0532 8.66574 12.2653C8.61993 12.169 8.59355 12.0645 8.58812 11.9579C8.58268 11.8513 8.59829 11.7447 8.63405 11.6442C8.66981 11.5436 8.72503 11.4511 8.79654 11.3719C8.86806 11.2927 8.95448 11.2284 9.05086 11.1825C9.24552 11.09 9.46896 11.0786 9.67202 11.1509C9.87509 11.2231 10.0411 11.373 10.1337 11.5677C10.3759 12.0768 10.7574 12.5068 11.2341 12.8079C11.7108 13.109 12.263 13.2688 12.8268 13.2688C13.3906 13.2688 13.9429 13.109 14.4195 12.8079C14.8962 12.5068 15.2778 12.0768 15.52 11.5677Z" fill="#141414" />
              </svg>
              {(isAuthenticated && cartItems?.length > 0) && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* Profile dropdown */}
            {!isAuthenticated ? (
              <button
                onClick={handleProfileClick}
                className="relative flex rounded-full focus:outline-none focus:ring-0 focus:ring-offset-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 26 26" fill="none">
                  <path d="M13.4792 12.7292C16.3175 12.7292 18.625 10.4217 18.625 7.58333C18.625 4.745 16.3175 2.4375 13.4792 2.4375C10.6408 2.4375 8.33333 4.745 8.33333 7.58333C8.33333 10.4217 10.6408 12.7292 13.4792 12.7292ZM13.4792 4.0625C15.4183 4.0625 17 5.64417 17 7.58333C17 9.5225 15.4183 11.1042 13.4792 11.1042C11.54 11.1042 9.95833 9.5225 9.95833 7.58333C9.95833 5.64417 11.54 4.0625 13.4792 4.0625ZM16.7292 14.3542H10.2292C6.795 14.3542 4 17.1492 4 20.5833C4 22.23 5.3325 23.5625 6.97917 23.5625H19.9792C21.6258 23.5625 22.9583 22.23 22.9583 20.5833C22.9583 17.1492 20.1633 14.3542 16.7292 14.3542ZM19.9792 21.9375H6.97917C6.23167 21.9375 5.625 21.3308 5.625 20.5833C5.62786 19.3631 6.11386 18.1937 6.97669 17.3309C7.83952 16.468 9.00895 15.982 10.2292 15.9792H16.7292C17.9494 15.982 19.1188 16.468 19.9816 17.3309C20.8445 18.1937 21.3305 19.3631 21.3333 20.5833C21.3333 21.3308 20.7267 21.9375 19.9792 21.9375Z" fill="#141414" />
                </svg>
              </button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <div
                  className="flex items-center gap-3 cursor-pointer pl-4 hover:text-black transition-colors border-l border-gray-100"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className='w-8 h-8'>
                    {user?.photo ? (
                      <img
                        src={user?.photo}
                        alt={name}
                        className="w-full h-full object-cover rounded-full border border-gray-200"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white text-sm font-bold border border-gray-200 uppercase">
                        {user?.firstName?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="hidden md:flex items-center gap-1">
                    <MdKeyboardArrowDown size={16} className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Dropdown Menu */}
                <Transition
                  show={isProfileOpen}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95 translate-y-2"
                  enterTo="transform opacity-100 scale-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="transform opacity-100 scale-100 translate-y-0"
                  leaveTo="transform opacity-0 scale-95 translate-y-2"
                >
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-100 z-50 ring-1 ring-black ring-opacity-5">
                    <div className="py-2">
                      <button onClick={() => { setIsProfileOpen(false); navigate('/profile'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors group">
                        <MdPerson size={18} className="text-gray-400 group-hover:text-black transition-colors" />
                        <span>Profile</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors group">
                        <MdSettings size={18} className="text-gray-400 group-hover:text-black transition-colors" />
                        <span>Settings</span>
                      </button>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors group">
                        <MdLogout size={18} className="text-red-400 group-hover:text-red-600 transition-colors" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </Transition>
              </div>
            )}
            <AuthModal isOpen={isAuthModalOpen} closeModal={() => setAuthModalOpen(false)} />
          </div>
        </div>
      </div >

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as={Link}
              to={item.href}
              className={classNames(
                location.pathname === item.href
                  ? 'bg-gray-900 text-white dark:bg-gray-950/50'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white',
                'block rounded-md px-3 py-2 text-base font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>

      {/* Search Overlay */}
      <Transition appear show={isSearchOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsSearchOpen(false)}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </TransitionChild>

          <div className="fixed inset-0 z-50 overflow-y-auto w-full">
            <div className="min-h-full">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 -translate-y-8"
                enterTo="opacity-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 -translate-y-8"
              >
                <DialogPanel className="w-full bg-white shadow-xl relative">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Search Header */}
                    <div className="flex items-center gap-2 mb-8 pt-4">
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiSearch className="text-gray-400" size={20} />
                        </div>
                        <form onSubmit={handleSearch}>
                          <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border-none bg-gray-100 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                            placeholder="Search for products, brands and more"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                          />
                        </form>
                      </div>
                      {/* Close Button Absolute Top Right */}
                      <button
                        onClick={() => setIsSearchOpen(false)}
                        className="p-2 text-gray-400 hover:text-black transition-colors z-10"
                      >
                        <FiX size={24} />
                      </button>
                    </div>

                    {!searchQuery ? (
                      /* Default/Trending UI */
                      <>
                        {/* Trending Searches using Mock Data */}
                        <div className="mb-8">
                          <h3 className="text-sm font-bold text-gray-900 mb-4">Trending Search</h3>
                          <div className="flex flex-wrap gap-3">
                            {trendingTags.map((tag) => (
                              <button key={tag} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-black hover:text-black transition-colors" onClick={() => setSearchQuery(tag)}>
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Trending Products */}
                        <div className="mb-8">
                          <h3 className="text-sm font-bold text-gray-900 mb-4">Trending Products</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.slice(0, 4).map((p) => {
                              const product = getProductDisplay(p);
                              return (
                                <div key={product.id} className="group relative flex gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                  <div className="w-20 h-24 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                                    <img src={product.image} alt={product.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" />
                                  </div>
                                  <div className="flex flex-col justify-center">
                                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{product.title}</h4>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-bold">₹{product.price.toLocaleString()}</span>
                                      <span className="text-xs text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                      <span className="text-xs text-green-600 font-medium">{product.discount}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-yellow-400">★</span>
                                      <span className="text-xs text-gray-600">{product.rating}</span>
                                    </div>
                                  </div>
                                  <Link to={`/product/${product.id}`} className="absolute inset-0" onClick={() => setIsSearchOpen(false)} />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Popular Brands */}
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 mb-4">Popular Brands</h3>
                          <div className="flex flex-wrap gap-3">
                            {popularBrands.map((brand) => (
                              <button key={brand} className="px-6 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-black hover:text-black transition-colors" onClick={() => setSearchQuery(brand)}>
                                {brand}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : hasResults ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Suggested List (Left Column) */}
                        <div className="hidden md:block col-span-1 border-r border-gray-100 pr-4">
                          <h3 className="text-sm font-bold text-gray-900 mb-4">Suggested</h3>
                          <div className="flex flex-col gap-3">
                            {filteredSuggestions.slice(0, 10).map((tag, idx) => (
                              <button
                                key={idx}
                                className="text-left text-sm text-gray-600 hover:text-black hover:font-medium transition-colors py-1"
                                onClick={() => { setSearchQuery(tag); }}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Suggested Products (Right Column) */}
                        <div className="col-span-1 md:col-span-3">
                          <h3 className="text-sm font-bold text-gray-900 mb-4">Suggested Products</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.slice(0, 6).map((p) => {
                              const product = getProductDisplay(p);
                              return (
                                <div key={product.id} className="group relative flex flex-col gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                  <div className="aspect-[4/5] w-full bg-gray-200 rounded-lg overflow-hidden relative">
                                    <img src={product.image} alt={product.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                      <span className="text-yellow-400">★</span> {product.rating}
                                    </div>
                                  </div>
                                  <div className="flex flex-col mt-2">
                                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{product.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-sm font-bold">₹{product.price.toLocaleString()}</span>
                                      <span className="text-xs text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                      <span className="text-xs text-green-600 font-medium">{product.discount}</span>
                                    </div>
                                  </div>
                                  <Link to={`/product/${product.id}`} className="absolute inset-0" onClick={() => setIsSearchOpen(false)} />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Not Found UI */
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="text-gray-500 mb-2 font-medium">You searched for <span className="text-black font-bold">“{searchQuery}”</span></div>

                        <div className="relative w-24 h-24 my-6 flex items-center justify-center bg-gray-100 rounded-full">
                          <FiSearch className="text-gray-400 w-10 h-10" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-gray-200 -rotate-45 hidden" /> {/* Strikethrough effect conceptual */}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">We couldn't find any matches!</h3>
                        <p className="text-gray-500 text-sm">Please check the spelling or try searching for something else.</p>
                      </div>
                    )}

                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Disclosure >
  )
}
