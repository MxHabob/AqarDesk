# Email

Arabic RTL React Email templates for staff invitations and password resets.
`EmailProvider` is the delivery boundary; configure a provider in the
application without coupling templates to a vendor.

The package only creates messages. It does not send email or contain provider
credentials. Action URLs must be absolute HTTP(S) URLs and should be generated
by the server using the configured canonical application URL.
