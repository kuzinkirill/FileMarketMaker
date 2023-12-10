import { type ComponentProps, forwardRef } from 'react'
import { type AriaButtonProps } from 'react-aria'
import { Link } from 'react-router-dom'

import LogoIcon from '../../../../assets/img/FMMakerLogoHeader.svg'
import { type BreakpointsOptions, styled } from '../../../../styles'
import { Drip, useButton } from '../../../UIkit'

const Logo = styled('img', {
  height: '80%',
  objectFit: 'contain',
})

const LinkStyled = styled(Link, {
  height: '100%',
  outline: 'none',
  border: 'none',
  userSelect: 'none',
  borderRadius: 0,
  background: 'transparent',
  display: 'inline-flex',
  gap: '$2',
  alignItems: 'center',
  justifyContent: 'start',
  padding: '0',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  fontFamily: '$primary',
  transition: 'transform 0.25s ease 0s',
  '& .gradient, & .black': {
    transition: 'opacity 0.25s ease 0s',
  },
  '& .gradient': {
    opacity: 0,
  },
  '& .black': {
    opacity: 1,
  },
  '&[data-pressed=true]': {
    transform: 'scale(0.97)',
  },
  '&[data-hovered=true]': {
    '.gradient': {
      opacity: 1,
    },
    '.black': {
      opacity: 0,
    },
  },
  '&[data-disabled=true]': {
    cursor: 'not-allowed',
  },
  '&[data-focus-ring=true]': {
    focusRing: '$blue500',
  },
})

export type AppLogoButtonProps = AriaButtonProps & ComponentProps<typeof LinkStyled> & {
  hideNameIn?: BreakpointsOptions
}

export const AppLogoButton = forwardRef<HTMLAnchorElement, AppLogoButtonProps>((
  {
    hideNameIn,
    ...otherProps
  },
  ref,
) => {
  const {
    buttonRef,
    buttonProps,
    dripProps,
  } = useButton(otherProps, ref)

  return (
    <LinkStyled
      {...buttonProps}
      ref={buttonRef}
    >
      <Logo
        src={LogoIcon}
        alt="FileMarket Maker logo"
      />
      <Drip {...dripProps} />
    </LinkStyled>
  )
})
