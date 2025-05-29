'use client'
import type { GetProps } from 'antd'
import Icon from '@ant-design/icons'
type CustomIconComponentProps = GetProps<typeof Icon>
const GiteeSvg = () => (
  <svg
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="1456"
    data-darkreader-inline-fill=""
    fill="currentColor"
    width="1em"
    height="1em"
  >
    <path
      d="M512 1024q-104 0-199-40-92-39-163-110T40 711Q0 616 0 512t40-199Q79 221 150 150T313 40q95-40 199-40t199 40q92 39 163 110t110 163q40 95 40 199t-40 199q-39 92-110 163T711 984q-95 40-199 40z m259-569H480q-10 0-17.5 7.5T455 480v64q0 10 7.5 17.5T480 569h177q11 0 18.5 7.5T683 594v13q0 31-22.5 53.5T607 683H367q-11 0-18.5-7.5T341 657V417q0-31 22.5-53.5T417 341h354q11 0 18-7t7-18v-63q0-11-7-18t-18-7H417q-38 0-72.5 14T283 283q-27 27-41 61.5T228 417v354q0 11 7 18t18 7h373q46 0 85.5-22.5t62-62Q796 672 796 626V480q0-10-7-17.5t-18-7.5z"
      p-id="1457"
    ></path>
  </svg>
)
const LawSvg = () => (
  <svg
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="1059"
    data-darkreader-inline-fill=""
    fill="currentColor"
    width="1em"
    height="1em"
  >
    <path
      d="M512 256c-53.12 0-96-42.88-96-96S458.88 64 512 64s96 42.88 96 96S565.12 256 512 256z m448 384c0 71.04-56.96 128-128 128h-64c-71.04 0-128-56.96-128-128l128-256h-64c-35.2 0-64-28.8-64-64H576v512c26.88 0 64 28.8 64 64h64c26.88 0 64 28.8 64 64H256c0-35.2 37.12-64 64-64h64c0-35.2 37.12-64 64-64h1.92L448 320H384c0 35.2-28.8 64-64 64H256l128 256c0 71.04-56.96 128-128 128H192c-71.04 0-128-56.96-128-128l128-256H128V320h192c0-35.2 28.8-64 64-64h256c35.2 0 64 28.8 64 64h192v64h-64l128 256zM224 448L128 640h192L224 448zM896 640l-96-192-96 192h192z"
      fill=""
      p-id="1060"
    ></path>
  </svg>
)
const IssuesSvg = () => (
  <svg
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="913"
    data-darkreader-inline-fill=""
    fill="currentColor"
    width="1em"
    height="1em"
  >
    <path
      d="M514.279 64.175c58.892 0 115.944 11.042 171.155 33.127s103.675 54.598 145.39 97.54 74.229 91.405 97.54 145.39c23.311 53.984 33.74 111.65 31.286 172.995 2.454 90.792-22.085 173.609-73.615 248.451s-119.011 129.44-202.441 163.793c-83.43 34.354-169.315 42.942-257.653 25.765-88.338-17.177-165.02-57.665-230.047-121.465S89.765 689.289 72.588 599.725 64 423.662 98.354 340.232s89.565-150.297 165.634-200.601 159.499-75.456 250.291-75.456z m0 828.169c49.077 0 96.926-9.815 143.549-29.446 46.623-19.631 87.725-47.236 123.305-82.817 35.581-35.581 63.186-76.682 82.817-123.305 19.631-46.623 29.446-94.473 29.446-143.549 0-78.523-21.471-149.684-64.413-213.484S728.989 189.32 657.828 159.874 513.665 123.68 438.823 139.63s-139.255 50.917-193.239 104.901-88.952 118.399-104.902 193.241-9.202 147.843 20.244 219.005 76.069 128.213 139.869 171.155 134.961 64.412 213.484 64.412z m-69.935-379.117c0-19.631 6.748-36.194 20.244-49.69 13.496-13.496 29.446-20.244 47.85-20.244s34.354 6.748 47.85 20.244c13.496 13.496 20.244 29.446 20.244 47.85s-6.748 34.354-20.244 47.85c-13.496 13.496-29.446 20.244-47.85 20.244s-34.354-6.748-47.85-20.244c-13.496-13.497-20.244-28.833-20.244-46.01z"
      p-id="914"
    ></path>
  </svg>
)
const RoundSvg = () => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="50" r="40" fill="currentColor" />
  </svg>
)
export function GiteeIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={GiteeSvg} {...props} />
}
export function LawIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={LawSvg} {...props} />
}
export function IssuesIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={IssuesSvg} {...props} />
}
export function RoundIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={RoundSvg} {...props} />
}
