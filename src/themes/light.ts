import { theme, type ThemeConfig } from 'antd'
export default {
  token: {
    colorPrimary: '#00c16a',
    colorBgBase: '#ffffff',
    green: '#00dc82',
    colorSuccess: '#00dc82',
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
