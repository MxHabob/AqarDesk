"use server"

import { auth } from "@aqardesk/auth/server"
import {
  deleteListingMedia,
  getListingMediaById,
  getOwnerById,
  getPropertyById,
  restoreOwner,
  restoreProperty,
  revokeShortLink,
} from "@aqardesk/database/queries"
import { deleteStorageObject, storageProvider } from "@aqardesk/storage/server"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod"
import { assertPermission } from "@/lib/auth/permissions"

async function getActor() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Unauthorized")
  return session.user
}

export async function restoreArchivedPropertyAction(idInput: string) {
  const actor = await getActor()
  await assertPermission(actor.id, "properties.archive")
  const id = z.uuid().parse(idInput)
  const property = await getPropertyById(id)
  if (!property?.archivedAt) {
    throw new Error("This property is not archived.")
  }
  const restored = await restoreProperty(id, actor)
  if (!restored) throw new Error("The property could not be restored.")
  revalidatePath("/[locale]/dashboard/settings/archive", "page")
  revalidatePath("/[locale]/dashboard/properties", "page")
}

export async function restoreArchivedOwnerAction(idInput: string) {
  const actor = await getActor()
  await assertPermission(actor.id, "owners.update")
  const id = z.uuid().parse(idInput)
  const owner = await getOwnerById(id)
  if (!owner?.archivedAt) throw new Error("This owner is not archived.")
  const restored = await restoreOwner(id, actor)
  if (!restored) throw new Error("The owner could not be restored.")
  revalidatePath("/[locale]/dashboard/settings/archive", "page")
  revalidatePath("/[locale]/dashboard/owners", "page")
}

export async function deleteManagedMediaAction(idInput: string) {
  const actor = await getActor()
  await assertPermission(actor.id, "media.manage")
  const id = z.uuid().parse(idInput)
  const media = await getListingMediaById(id)
  if (!media) throw new Error("The media record no longer exists.")
  if (media.storageProvider !== storageProvider) {
    throw new Error("This media uses an unsupported storage provider.")
  }

  const deleted = await deleteListingMedia(id, actor)
  if (!deleted) throw new Error("The media record could not be deleted.")
  try {
    await deleteStorageObject(media.objectKey)
  } catch (error) {
    console.error("Failed to remove a managed listing media object.", error)
    revalidatePath("/[locale]/dashboard/settings/media", "page")
    throw new Error(
      "The media record was removed, but its storage object could not be deleted."
    )
  }
  revalidatePath("/[locale]/dashboard/settings/media", "page")
}

export async function revokeManagedShortLinkAction(idInput: string) {
  const actor = await getActor()
  await assertPermission(actor.id, "listings.share")
  const id = z.uuid().parse(idInput)
  const revoked = await revokeShortLink(id, actor)
  if (!revoked) throw new Error("This link has already been revoked.")
  revalidatePath("/[locale]/dashboard/settings/share-links", "page")
}
