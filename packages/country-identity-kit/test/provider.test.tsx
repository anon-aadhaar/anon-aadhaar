import * as React from 'react'
import { assert } from 'chai'
import { CountryIdentityProvider } from '../src/provider/countryIdentityProvider'
import { render, screen } from '@testing-library/react'

describe('CountryIdentityProvider', () => {
  it('renders children', () => {
    render(
      <CountryIdentityProvider>
        <div>Test Children</div>
      </CountryIdentityProvider>,
    )

    assert(screen.getByText('Test Children') != null, 'Should not be null')
  })
})
