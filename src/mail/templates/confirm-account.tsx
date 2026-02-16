import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind
} from '@react-email/components';

interface ConfirmAccountEmailProps {
  username?: string;
  confirmationLink: string;
}

export const ConfirmAccountEmail = ({
  username,
  confirmationLink,
}: ConfirmAccountEmailProps) => {
  const previewText = `Confirme sua conta no Kanban Axisor`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Confirme sua conta
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Olá {username},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Bem-vindo ao Kanban Axisor! Por favor, confirme sua conta para começar.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={confirmationLink}
              >
                Confirmar Conta
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              ou copie e cole esta URL no seu navegador:
              <br />
              <Link href={confirmationLink} className="text-blue-600 no-underline">
                {confirmationLink}
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ConfirmAccountEmail;
