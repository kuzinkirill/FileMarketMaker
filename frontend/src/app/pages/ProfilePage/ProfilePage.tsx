import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'

import ProfileImage from '../../components/ViewInfo/ProfileImage/ProfileImage'
import { useProfileStoreWithUtils } from '../../hooks/useProfileStoreWithUtils.ts'
import { Button, PageLayout, Txt } from '../../UIkit'
import { Tabs } from '../../UIkit/Tabs'
import { TabsContainer } from '../../UIkit/Tabs/TabsContainer'
import { copyToClipboard } from '../../utils/clipboard/clipboard'
import { getProfileImageUrl, reduceAddress } from '../../utils/nfts'
import { type Params } from '../../utils/router'
import {
  AddressesButtonsContainer,
  GrayOverlay,
  Inventory,
  Profile,
  ProfileHeader,
  ProfileName,
} from './ProfilePage.styles'

// По хорошему затянуть SVGR на проект, чтобы импортить SVG как компонент напрямую из assets
const CopySVGIcon = observer(() => (
  <svg
    width="21"
    height="20"
    viewBox="0 0 21 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.4961 18L18.4961 13M13.4961 18H8.49609V15M13.4961 18V13H18.4961M18.4961 13V5H12.4961M8.49609 15V5H12.4961M8.49609 15H2.49609V2H12.4961V5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
  </svg>
))

const ProfilePage: React.FC = observer(() => {
  const { profileAddress } = useParams<Params>()
  const navigate = useNavigate()

  const tabs = useMemo(() => [
    {
      value: 'owned',
      label: 'MyDeals',
      url: 'owned',
      amount: 777,
    },
    {
      value: 'withdraw',
      label: 'Withdraw',
      url: 'withdraw',
      amount: 666,
    },
  ], [])

  const { isMiner } = useProfileStoreWithUtils(profileAddress)

  return (
    <GrayOverlay style={{ width: '100%', overflow: 'hidden' }}>
      <PageLayout lowH>
        <Profile>
          <ProfileHeader>
            <ProfileImage
              src={getProfileImageUrl(profileAddress ?? '')}
            />
            <ProfileName>{reduceAddress(profileAddress ?? '')}</ProfileName>
          </ProfileHeader>
          { isMiner && (
            <Button
              settings
              onClick={() => {
                navigate('/create')
              }}
            >
              Create Deal
            </Button>
          )}
        </Profile>
        <AddressesButtonsContainer>
          <Button
            settings
            type="button"
            onClick={() => {
              copyToClipboard(profileAddress)
            }}
          >
            <Txt primary2>{reduceAddress(profileAddress ?? '')}</Txt>
            <CopySVGIcon />
          </Button>
        </AddressesButtonsContainer>
      </PageLayout>

      <Inventory>
        <TabsContainer>
          <Tabs tabs={tabs} isSmall isTransparent />
        </TabsContainer>
        <Outlet />
      </Inventory>
    </GrayOverlay>
  )
})

export default ProfilePage
