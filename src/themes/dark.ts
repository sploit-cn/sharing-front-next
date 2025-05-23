import { theme, type ThemeConfig } from 'antd'
export default {
  token: {
    // colorPrimary: '#04ab6c',
    colorBgBase: '#23272f',
  },
  algorithm: [theme.darkAlgorithm],
  components: {
    Layout: {
      headerBg: '#23272f88',
    },
    List: {
      borderRadiusLG: 16,
    },
  },
} as ThemeConfig
