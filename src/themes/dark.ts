import { theme, type ThemeConfig } from 'antd'
export default {
  token: {
    colorPrimary: '#00dc82',
    colorBgBase: '#23272f',
    green: '#00dc82',
    colorSuccess: '#00dc82',
  },
  algorithm: [theme.darkAlgorithm],
  components: {
    Layout: {
      headerBg: '#23272f44',
    },
    List: {
      borderRadiusLG: 16,
    },
  },
} as ThemeConfig
