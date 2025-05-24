import { Space } from 'antd'
import type { SpaceSize } from 'antd/es/space'
import React from 'react'

const IconText = ({
  icon,
  text,
  size = 'small',
}: {
  icon: React.FC
  text: string
  size?: SpaceSize
}) => (
  <Space size={size}>
    {React.createElement(icon)}
    {text}
  </Space>
)
export default IconText
