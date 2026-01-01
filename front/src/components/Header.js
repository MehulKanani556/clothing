import { useState } from 'react'
import { Disclosure, DisclosureButton, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useDispatch, useSelector } from 'react-redux';
import AuthModal from './AuthModal';
import { logout } from '../redux/slice/auth.slice';

const navigation = [
  { name: 'New Arrivals', href: '#', current: true },
  { name: 'Men', href: '#', current: false },
  { name: 'Women', href: '#', current: false },
  { name: 'Premium', href: '#', current: false },
  { name: 'Best Sellers', href: '#', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Header() {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Disclosure
      as="nav"
      className="relative bg-white dark:bg-white-800/50 dark:after:pointer-events-none dark:after:absolute dark:after:inset-x-0 dark:after:bottom-0 dark:after:h-px dark:after:bg-white/10"
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
            <div className="flex shrink-0 items-center text-2xl font-bold">
              LOGO
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex gap-3 space-x-4">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    aria-current={item.current ? 'page' : undefined}
                    className={classNames(
                      item.current
                        ? 'font-bold border-b-2 border-black'
                        : 'font-regular',
                      ' px-1 py-2 text-sm text-black',
                    )}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center gap-3 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <button
              type="button"
              className="relative rounded-full p-1  text-black focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500 dark:hover:text-white"
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">View notifications</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 21" fill="none">
                <path d="M20.8235 19.1471L15.8824 14.2059C17.0294 12.7059 17.7353 10.8529 17.7353 8.82353C17.7353 3.97059 13.7647 0 8.91176 0C4.05882 0 0 3.97059 0 8.82353C0 13.6765 3.97059 17.6471 8.82353 17.6471C10.8529 17.6471 12.7941 16.9412 14.2941 15.7059L19.2353 20.6471C19.4118 20.8235 19.7647 21 20.0294 21C20.2941 21 20.5588 20.9118 20.8235 20.6471C21.2647 20.2941 21.2647 19.5882 20.8235 19.1471ZM2.20588 8.82353C2.20588 5.20588 5.20588 2.20588 8.82353 2.20588C12.4412 2.20588 15.4412 5.20588 15.4412 8.82353C15.4412 12.4412 12.4412 15.4412 8.82353 15.4412C5.20588 15.4412 2.20588 12.5294 2.20588 8.82353Z" fill="#141414" />
              </svg>
            </button>
            <button
              type="button"
              className="relative rounded-full p-1  text-black focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500 dark:hover:text-white"
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">View notifications</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 26 26" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M20.7797 9.04551L21.6463 22.0455C21.6681 22.3784 21.6214 22.7123 21.5091 23.0265C21.3967 23.3406 21.2212 23.6285 20.9933 23.8721C20.7653 24.1158 20.4899 24.3101 20.1839 24.4431C19.8779 24.5762 19.5479 24.645 19.2143 24.6455H6.43743C6.10369 24.6454 5.77354 24.5767 5.46741 24.4438C5.16127 24.3109 4.88568 24.1165 4.6577 23.8728C4.42971 23.6291 4.25418 23.3411 4.14197 23.0268C4.02976 22.7125 3.98326 22.3785 4.00535 22.0455L4.87201 9.04551C4.91324 8.42855 5.1874 7.85031 5.63896 7.42791C6.09053 7.0055 6.68576 6.77051 7.3041 6.77051H18.3476C18.9659 6.77051 19.5612 7.0055 20.0127 7.42791C20.4643 7.85031 20.7385 8.42855 20.7797 9.04551ZM19.1579 9.15384C19.1442 8.94825 19.0529 8.75556 18.9024 8.61476C18.752 8.47397 18.5536 8.3956 18.3476 8.39551H7.3041C7.09805 8.3956 6.89973 8.47397 6.74928 8.61476C6.59884 8.75556 6.5075 8.94825 6.49377 9.15384L5.6271 22.1538C5.61936 22.2649 5.63459 22.3764 5.67183 22.4813C5.70907 22.5862 5.76753 22.6823 5.84356 22.7636C5.9196 22.8449 6.01157 22.9097 6.11374 22.9539C6.21592 22.9981 6.32611 23.0208 6.43743 23.0205H19.2143C19.3256 23.0208 19.4358 22.9981 19.538 22.9539C19.6401 22.9097 19.7321 22.8449 19.8081 22.7636C19.8842 22.6823 19.9426 22.5862 19.9799 22.4813C20.0171 22.3764 20.0323 22.2649 20.0246 22.1538L19.1579 9.15384Z" fill="#141414" />
                <path fillRule="evenodd" clipRule="evenodd" d="M17.431 7.58317C17.431 7.79866 17.3454 8.00532 17.193 8.1577C17.0406 8.31007 16.834 8.39567 16.6185 8.39567C16.403 8.39567 16.1963 8.31007 16.044 8.1577C15.8916 8.00532 15.806 7.79866 15.806 7.58317V5.95817C15.806 5.16805 15.4921 4.41028 14.9334 3.85158C14.3747 3.29288 13.6169 2.979 12.8268 2.979C12.0367 2.979 11.2789 3.29288 10.7202 3.85158C10.1615 4.41028 9.84766 5.16805 9.84766 5.95817V7.58317C9.84766 7.79866 9.76205 8.00532 9.60968 8.1577C9.45731 8.31007 9.25064 8.39567 9.03516 8.39567C8.81967 8.39567 8.61301 8.31007 8.46063 8.1577C8.30826 8.00532 8.22266 7.79866 8.22266 7.58317V5.95817C8.22266 4.73707 8.70774 3.56598 9.57119 2.70253C10.4346 1.83908 11.6057 1.354 12.8268 1.354C14.0479 1.354 15.219 1.83908 16.0825 2.70253C16.9459 3.56598 17.431 4.73707 17.431 5.95817V7.58317ZM15.52 11.5677C15.5658 11.4713 15.6301 11.3849 15.7094 11.3134C15.7886 11.2418 15.8811 11.1866 15.9816 11.1509C16.0822 11.1151 16.1888 11.0995 16.2954 11.1049C16.4019 11.1104 16.5064 11.1367 16.6028 11.1825C16.6992 11.2284 16.7856 11.2927 16.8571 11.3719C16.9286 11.4511 16.9838 11.5436 17.0196 11.6442C17.0554 11.7447 17.071 11.8513 17.0655 11.9579C17.0601 12.0645 17.0337 12.169 16.9879 12.2653C16.6148 13.0532 16.0256 13.7189 15.289 14.1851C14.5524 14.6513 13.6986 14.8988 12.8268 14.8988C11.9551 14.8988 11.1012 14.6513 10.3646 14.1851C9.62801 13.7189 9.03887 13.0532 8.66574 12.2653C8.61993 12.169 8.59355 12.0645 8.58812 11.9579C8.58268 11.8513 8.59829 11.7447 8.63405 11.6442C8.66981 11.5436 8.72503 11.4511 8.79654 11.3719C8.86806 11.2927 8.95448 11.2284 9.05086 11.1825C9.24552 11.09 9.46896 11.0786 9.67202 11.1509C9.87509 11.2231 10.0411 11.373 10.1337 11.5677C10.3759 12.0768 10.7574 12.5068 11.2341 12.8079C11.7108 13.109 12.263 13.2688 12.8268 13.2688C13.3906 13.2688 13.9429 13.109 14.4195 12.8079C14.8962 12.5068 15.2778 12.0768 15.52 11.5677Z" fill="#141414" />
              </svg>
            </button>

            {/* Profile dropdown */}
            {!isAuthenticated ? (
              <button
                onClick={handleProfileClick}
                className="relative flex rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 26 26" fill="none">
                  <path d="M13.4792 12.7292C16.3175 12.7292 18.625 10.4217 18.625 7.58333C18.625 4.745 16.3175 2.4375 13.4792 2.4375C10.6408 2.4375 8.33333 4.745 8.33333 7.58333C8.33333 10.4217 10.6408 12.7292 13.4792 12.7292ZM13.4792 4.0625C15.4183 4.0625 17 5.64417 17 7.58333C17 9.5225 15.4183 11.1042 13.4792 11.1042C11.54 11.1042 9.95833 9.5225 9.95833 7.58333C9.95833 5.64417 11.54 4.0625 13.4792 4.0625ZM16.7292 14.3542H10.2292C6.795 14.3542 4 17.1492 4 20.5833C4 22.23 5.3325 23.5625 6.97917 23.5625H19.9792C21.6258 23.5625 22.9583 22.23 22.9583 20.5833C22.9583 17.1492 20.1633 14.3542 16.7292 14.3542ZM19.9792 21.9375H6.97917C6.23167 21.9375 5.625 21.3308 5.625 20.5833C5.62786 19.3631 6.11386 18.1937 6.97669 17.3309C7.83952 16.468 9.00895 15.982 10.2292 15.9792H16.7292C17.9494 15.982 19.1188 16.468 19.9816 17.3309C20.8445 18.1937 21.3305 19.3631 21.3333 20.5833C21.3333 21.3308 20.7267 21.9375 19.9792 21.9375Z" fill="#141414" />
                </svg>
              </button>
            ) : (
              <Menu as="div" className="relative">
                <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 26 26" fill="none">
                    <path d="M13.4792 12.7292C16.3175 12.7292 18.625 10.4217 18.625 7.58333C18.625 4.745 16.3175 2.4375 13.4792 2.4375C10.6408 2.4375 8.33333 4.745 8.33333 7.58333C8.33333 10.4217 10.6408 12.7292 13.4792 12.7292ZM13.4792 4.0625C15.4183 4.0625 17 5.64417 17 7.58333C17 9.5225 15.4183 11.1042 13.4792 11.1042C11.54 11.1042 9.95833 9.5225 9.95833 7.58333C9.95833 5.64417 11.54 4.0625 13.4792 4.0625ZM16.7292 14.3542H10.2292C6.795 14.3542 4 17.1492 4 20.5833C4 22.23 5.3325 23.5625 6.97917 23.5625H19.9792C21.6258 23.5625 22.9583 22.23 22.9583 20.5833C22.9583 17.1492 20.1633 14.3542 16.7292 14.3542ZM19.9792 21.9375H6.97917C6.23167 21.9375 5.625 21.3308 5.625 20.5833C5.62786 19.3631 6.11386 18.1937 6.97669 17.3309C7.83952 16.468 9.00895 15.982 10.2292 15.9792H16.7292C17.9494 15.982 19.1188 16.468 19.9816 17.3309C20.8445 18.1937 21.3305 19.3631 21.3333 20.5833C21.3333 21.3308 20.7267 21.9375 19.9792 21.9375Z" fill="#141414" />
                  </svg>
                </MenuButton>

                <MenuItems
                  transition
                  className="absolute right-0 z-[9999] mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                >
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5"
                    >
                      Your profile
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5"
                    >
                      Settings
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden dark:text-gray-300 dark:data-focus:bg-white/5"
                    >
                      Sign out
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            )}

            <AuthModal isOpen={isAuthModalOpen} closeModal={() => setAuthModalOpen(false)} />
          </div>
        </div>
      </div>

      {/* <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                item.current
                  ? 'bg-gray-900 text-white dark:bg-gray-950/50'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white',
                'block rounded-md px-3 py-2 text-base font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel> */}
    </Disclosure>
  )
}
