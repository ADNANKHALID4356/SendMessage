const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding mock data for inbox and campaigns...');

  const workspace = await prisma.workspace.findFirst();
  if (!workspace) return;

  const fbAccount = await prisma.facebookAccount.upsert({
    where: {
      workspaceId_fbUserId: {
        workspaceId: workspace.id,
        fbUserId: 'mock_fb_user_123',
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      fbUserId: 'mock_fb_user_123',
      fbUserName: 'Mock FB User',
      accessToken: 'mock_access_token_123',
    },
  });

  const page = await prisma.page.upsert({
    where: {
      workspaceId_fbPageId: {
        workspaceId: workspace.id,
        fbPageId: 'mock_fb_page_123',
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      facebookAccountId: fbAccount.id,
      fbPageId: 'mock_fb_page_123',
      name: 'Mock Testing Page',
      accessToken: 'mock_page_token_123',
      category: 'Software Testing',
      followersCount: 1500,
      isActive: true,
      webhookSubscribed: true,
    },
  });

  console.log(`Created mock Page: ${page.name}`);

  const contacts = [];
  for (let i = 1; i <= 3; i++) {
    const contact = await prisma.contact.upsert({
      where: {
        pageId_psid: {
          pageId: page.id,
          psid: 'mock_psid_' + i,
        },
      },
      update: {},
      create: {
        workspaceId: workspace.id,
        pageId: page.id,
          psid: 'mock_psid_' + i,
        firstName: 'TestUser',
        lastName: '' + i,
        profilePictureUrl: 'https://i.pravatar.cc/150?u=' + i,
        isSubscribed: true,
        lastMessageFromContactAt:
          i === 1 ? new Date() : new Date(Date.now() - 48 * 60 * 60 * 1000),
        lastMessageToContactAt: new Date(Date.now() - 1000 * 60),
      },
    });
    contacts.push(contact);
  }

  console.log('Created mock Contacts.');

  for (const contact of contacts) {
    let conversation = await prisma.conversation.findFirst({
      where: { contactId: contact.id },
    });
    
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          workspaceId: workspace.id,
          pageId: page.id,
          contactId: contact.id,
          status: 'OPEN',
          unreadCount: 0,
          lastMessageAt: new Date(),
          lastMessagePreview: 'This is a mock message for testing.',
        },
      });

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          pageId: page.id,
          contactId: contact.id,
          direction: 'INBOUND',
          messageType: 'TEXT',
          fbMessageId: 'mid_' + Math.random().toString(36).substring(7),
          content: { text: 'Hello, I need help with testing.' },
          status: 'DELIVERED',
          createdAt: new Date(Date.now() - 5 * 60 * 1000),
        },
      });

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          pageId: page.id,
          contactId: contact.id,
          direction: 'OUTBOUND',
          messageType: 'TEXT',
          fbMessageId: 'mid_' + Math.random().toString(36).substring(7),
          content: { text: 'This is a mock message for testing.' },
          status: 'DELIVERED',
          createdAt: new Date(),
        },
      });
    }
  }

  console.log('Created mock Conversations and Messages.');
  console.log('Success! You can now test the Inbox and Campaigns using the Mock Page and Contacts.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());





