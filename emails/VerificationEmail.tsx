import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Button,
  Container,
} from "@react-email/components";

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({
  username,
  otp,
}: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Verification Code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Your verification code is {otp}</Preview>
      <Container
        style={{
          backgroundColor: "#f9f9f9",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <Section
          style={{
            backgroundColor: "#ffffff",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Heading as="h2" style={{ color: "#333" }}>
            Hello {username},
          </Heading>
          <Text style={{ fontSize: "16px", color: "#555" }}>
            Thank you for registering. Please use the following verification
            code to complete your registration:
          </Text>
          <Text
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#4CAF50",
              margin: "10px 0",
            }}
          >
            {otp}
          </Text>
          <Text style={{ fontSize: "14px", color: "#777" }}>
            If you did not request this code, please ignore this email.
          </Text>
          <Button
            href={`${process.env.NEXTAUTH_URL || process.env.VERCEL_URL}/verify/${username}`}
            style={{
              backgroundColor: "#4CAF50",
              color: "#ffffff",
              padding: "10px 20px",
              fontSize: "16px",
              borderRadius: "5px",
              textDecoration: "none",
              display: "inline-block",
              marginTop: "15px",
            }}
          >
            Verify Now
          </Button>
        </Section>
      </Container>
    </Html>
  );
}
