import { theme, type ThemeConfig } from 'antd'
export default {
  token: {
    // colorPrimary: '#40d18f',
  },
  algorithm: [theme.defaultAlgorithm],
  components: {
    Layout: {
      headerBg: '#ffffff00',
    },
    List: {
      borderRadiusLG: 16,
    },
  },
} as ThemeConfig
