"""
Tests for Club Membership roles and permissions
"""

import pytest
from django.db import IntegrityError
from apps.communities.models import ClubMembership


@pytest.mark.django_db
class TestClubMembership:
    """Test ClubMembership model and constraints"""

    def test_create_membership(self, create_user, reading_club):
        """Test creating a club membership"""
        new_user = create_user(email='newmember@example.com')

        membership = ClubMembership.objects.create(
            user=new_user,
            club=reading_club,
            role='MEMBER'
        )

        assert membership.user == new_user
        assert membership.club == reading_club
        assert membership.role == 'MEMBER'
        assert membership.is_approved is True

    def test_membership_unique_constraint(self, create_user, reading_club):
        """Test that a user can only have one membership per club"""
        duplicate_user = create_user(email='duplicate@example.com')

        ClubMembership.objects.create(
            user=duplicate_user,
            club=reading_club,
            role='MEMBER'
        )

        # Try to create duplicate membership
        with pytest.raises(IntegrityError):
            ClubMembership.objects.create(
                user=duplicate_user,
                club=reading_club,
                role='ADMIN'
            )

    def test_admin_role(self, create_user, reading_club):
        """Test ADMIN role"""
        admin_user = create_user(email='admin2@example.com')

        membership = ClubMembership.objects.create(
            user=admin_user,
            club=reading_club,
            role='ADMIN'
        )

        assert membership.role == 'ADMIN'

    def test_moderator_role(self, create_user, reading_club):
        """Test MODERATOR role"""
        mod_user = create_user(email='mod2@example.com')

        membership = ClubMembership.objects.create(
            user=mod_user,
            club=reading_club,
            role='MODERATOR'
        )

        assert membership.role == 'MODERATOR'

    def test_member_role(self, create_user, reading_club):
        """Test MEMBER role"""
        member_user = create_user(email='member2@example.com')

        membership = ClubMembership.objects.create(
            user=member_user,
            club=reading_club,
            role='MEMBER'
        )

        assert membership.role == 'MEMBER'

    def test_unapproved_membership(self, create_user, private_club):
        """Test creating an unapproved membership for private clubs"""
        pending_user = create_user(email='pending@example.com')

        membership = ClubMembership.objects.create(
            user=pending_user,
            club=private_club,
            role='MEMBER',
            is_approved=False
        )

        assert membership.is_approved is False

    def test_membership_str_representation(self, club_member, reading_club):
        """Test string representation of membership"""
        membership = ClubMembership.objects.get(user=club_member, club=reading_club)
        expected = f"{club_member.username} - {reading_club.name} ({membership.role})"

        assert str(membership) == expected

    def test_membership_cascade_delete_with_user(self, create_user, reading_club):
        """Test that membership is deleted when user is deleted"""
        temp_user = create_user(email='tempuser@example.com')

        ClubMembership.objects.create(
            user=temp_user,
            club=reading_club,
            role='MEMBER'
        )

        initial_count = ClubMembership.objects.filter(club=reading_club).count()

        temp_user.delete()

        # Membership should be cascade deleted
        assert ClubMembership.objects.filter(club=reading_club).count() == initial_count - 1

    def test_membership_cascade_delete_with_club(self, club_member, reading_club):
        """Test that all memberships are deleted when club is deleted"""
        initial_count = ClubMembership.objects.count()
        assert initial_count >= 2  # At least admin and member

        reading_club.delete()

        # All memberships should be cascade deleted
        assert ClubMembership.objects.count() == 0


@pytest.mark.django_db
class TestMembershipQuerysets:
    """Test querying memberships by different criteria"""

    def test_filter_by_club(self, reading_club, club_member, club_moderator):
        """Test filtering memberships by club"""
        memberships = ClubMembership.objects.filter(club=reading_club)

        # Should have admin (creator), member, and moderator
        assert memberships.count() == 3

    def test_filter_by_user(self, club_member, reading_club, private_club):
        """Test filtering memberships by user"""
        # Add member to private club
        ClubMembership.objects.create(
            user=club_member,
            club=private_club,
            role='MEMBER'
        )

        memberships = ClubMembership.objects.filter(user=club_member)
        assert memberships.count() == 2

    def test_filter_by_role(self, reading_club, club_member, club_moderator):
        """Test filtering memberships by role"""
        admins = ClubMembership.objects.filter(club=reading_club, role='ADMIN')
        moderators = ClubMembership.objects.filter(club=reading_club, role='MODERATOR')
        members = ClubMembership.objects.filter(club=reading_club, role='MEMBER')

        assert admins.count() == 1
        assert moderators.count() == 1
        assert members.count() == 1

    def test_get_club_members(self, reading_club, club_member, club_moderator):
        """Test getting all members of a club through the M2M relation"""
        members = reading_club.members.all()

        # Should include admin (from fixture), member, and moderator
        assert members.count() >= 3

    def test_get_user_clubs(self, club_member):
        """Test getting all clubs a user belongs to"""
        clubs = club_member.joined_clubs.all()

        assert clubs.count() == 1
        assert clubs.first().name == "Test Reading Club"


@pytest.mark.django_db
class TestMembershipRolePermissions:
    """Test different permission levels by role"""

    def test_admin_can_manage_club(self, reading_club):
        """Test that admin role is assigned to creator"""
        admin_membership = ClubMembership.objects.get(
            club=reading_club,
            role='ADMIN'
        )

        assert admin_membership.user == reading_club.creator

    def test_multiple_admins_allowed(self, reading_club, create_user):
        """Test that a club can have multiple admins"""
        new_admin = create_user(email='newadmin@example.com')

        ClubMembership.objects.create(
            user=new_admin,
            club=reading_club,
            role='ADMIN'
        )

        admins = ClubMembership.objects.filter(club=reading_club, role='ADMIN')
        assert admins.count() == 2

    def test_role_hierarchy(self, reading_club, club_member, club_moderator):
        """Test that we can identify different role levels"""
        admin = ClubMembership.objects.get(club=reading_club, role='ADMIN')
        moderator = ClubMembership.objects.get(club=reading_club, user=club_moderator)
        member = ClubMembership.objects.get(club=reading_club, user=club_member)

        assert admin.role == 'ADMIN'
        assert moderator.role == 'MODERATOR'
        assert member.role == 'MEMBER'

        # Verify they're all different roles
        assert admin.role != moderator.role != member.role
