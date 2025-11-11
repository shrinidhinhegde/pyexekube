import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

describe('UI component smoke tests', () => {
  it('renders an alert with title and description', () => {
    render(
      <Alert data-testid="alert" variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>,
    )

    expect(screen.getByTestId('alert')).toHaveAttribute('role', 'alert')
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders a composed card layout', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Example Card</CardTitle>
          <CardDescription>Some description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    )

    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByText('Example Card')).toBeInTheDocument()
    expect(screen.getByText('Some description')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('renders tabs and switches active content', async () => {
    const user = userEvent.setup()

    render(
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview content</TabsContent>
        <TabsContent value="details">Details content</TabsContent>
      </Tabs>,
    )

    expect(screen.getByText('Overview content')).toBeVisible()
    expect(screen.queryByText('Details content')).toBeNull()

    await user.click(screen.getByRole('tab', { name: 'Details' }))

    expect(screen.getByText('Details content')).toBeVisible()
  })

  it('renders a badge variant', () => {
    render(<Badge variant="secondary">Status</Badge>)

    expect(screen.getByText('Status')).toBeInTheDocument()
  })
})

