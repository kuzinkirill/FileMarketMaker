import { observer } from 'mobx-react-lite'

import { gradientPlaceholderImg } from '../../../UIkit'
import { StyledProfileImage, StyledProfileImageContent } from './ProfileImage.styles'

interface IProfileImageProps {
  src?: string
}

const ProfileImage = observer(({ src }: IProfileImageProps) => {
  return (
    <StyledProfileImage>

      <StyledProfileImageContent
        style={{
          backgroundImage: `url(${!!src ? src : gradientPlaceholderImg})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          borderRadius: '50%',
        }}
      />
    </StyledProfileImage>
  )
})

export default ProfileImage
